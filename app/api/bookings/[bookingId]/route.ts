import prisma from "@/lib/prisma"
import { fail, ok } from "@/lib/http"
import { requireSession } from "@/lib/auth-server"
import { createNotification } from "@/lib/notifications"
import { readJson } from "@/lib/api-utils"
import { resolveParams } from "@/lib/route-params"

type Params = { bookingId: string }

export async function GET(
  _request: Request,
  context: { params: Promise<Params> | Params }
) {
  const authResult = await requireSession()

  if (!authResult.ok) {
    return authResult.response
  }

  const { bookingId } = await resolveParams(context.params)

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      customer: { select: { id: true, name: true, email: true } },
      provider: { select: { id: true, name: true, email: true } },
      payment: true,
      review: true,
    },
  })

  if (!booking) {
    return fail("Booking not found", 404)
  }

  const role = authResult.session.user.role
  const userId = authResult.session.user.id
  const canView =
    role === "ADMIN" ||
    booking.customerId === userId ||
    booking.providerId === userId

  if (!canView) {
    return fail("Forbidden", 403)
  }

  return ok({ data: booking })
}

type UpdateBookingPayload = {
  status?: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  notes?: string
  scheduleAt?: string
}

export async function PATCH(
  request: Request,
  context: { params: Promise<Params> | Params }
) {
  const authResult = await requireSession()

  if (!authResult.ok) {
    return authResult.response
  }

  const payload = await readJson<UpdateBookingPayload>(request)

  if (!payload) {
    return fail("Invalid JSON payload", 400)
  }

  const { bookingId } = await resolveParams(context.params)

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })

  if (!booking) {
    return fail("Booking not found", 404)
  }

  const role = authResult.session.user.role
  const userId = authResult.session.user.id
  const isAdmin = role === "ADMIN"
  const isCustomer = booking.customerId === userId
  const isProvider = booking.providerId === userId

  if (!isAdmin && !isCustomer && !isProvider) {
    return fail("Forbidden", 403)
  }

  if (
    payload.status &&
    isCustomer &&
    !isAdmin &&
    payload.status !== "CANCELLED"
  ) {
    return fail("Customers can only cancel bookings", 403)
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
      ...(payload.status ? { status: payload.status } : {}),
      ...(payload.scheduleAt
        ? {
            scheduleAt: new Date(payload.scheduleAt),
          }
        : {}),
    },
  })

  if (payload.status) {
    await Promise.all([
      createNotification({
        userId: booking.customerId,
        title: "Booking status updated",
        message: `Your booking status is now ${payload.status}.`,
        type: "BOOKING",
      }),
      createNotification({
        userId: booking.providerId,
        title: "Booking status updated",
        message: `Booking status is now ${payload.status}.`,
        type: "BOOKING",
      }),
    ])
  }

  return ok({ data: updated })
}
