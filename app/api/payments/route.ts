import prisma from "@/lib/prisma"
import { fail, ok } from "@/lib/http"
import { requireSession } from "@/lib/auth-server"
import { getPagination, readJson, requireFields } from "@/lib/api-utils"
import { createNotification } from "@/lib/notifications"

export async function GET(request: Request) {
  const authResult = await requireSession()

  if (!authResult.ok) {
    return authResult.response
  }

  const role = authResult.session.user.role
  const url = new URL(request.url)
  const status = url.searchParams.get("status")
  const { page, limit, skip } = getPagination(url.searchParams)

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(role === "CUSTOMER" ? { customerId: authResult.session.user.id } : {}),
    ...(role === "PROVIDER" ? { providerId: authResult.session.user.id } : {}),
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            service: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ])

  return ok({
    data: payments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  })
}

type PaymentStubPayload = {
  bookingId: string
  method?: string
}

export async function POST(request: Request) {
  const authResult = await requireSession()

  if (!authResult.ok) {
    return authResult.response
  }

  const payload = await readJson<PaymentStubPayload>(request)

  if (!payload) {
    return fail("Invalid JSON payload", 400)
  }

  const missing = requireFields(payload as Record<string, unknown>, [
    "bookingId",
  ])

  if (missing) {
    return missing
  }

  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
  })

  if (!booking) {
    return fail("Booking not found", 404)
  }

  if (
    booking.customerId !== authResult.session.user.id &&
    authResult.session.user.role !== "ADMIN"
  ) {
    return fail("Forbidden", 403)
  }

  if (booking.paymentStatus === "SUCCESS") {
    return fail("Booking already paid", 409)
  }

  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId: booking.id },
  })

  const transactionRef = `mock-${Date.now()}-${booking.id.slice(0, 8)}`

  const payment = existingPayment
    ? await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: "SUCCESS",
          transactionRef,
          method: payload.method ?? "mock",
          amount: booking.totalAmount,
        },
      })
    : await prisma.payment.create({
        data: {
          bookingId: booking.id,
          customerId: booking.customerId,
          providerId: booking.providerId,
          amount: booking.totalAmount,
          status: "SUCCESS",
          transactionRef,
          method: payload.method ?? "mock",
        },
      })

  await prisma.booking.update({
    where: { id: booking.id },
    data: { paymentStatus: "SUCCESS", status: "CONFIRMED" },
  })

  await Promise.all([
    createNotification({
      userId: booking.customerId,
      title: "Payment successful",
      message: `Payment for booking ${booking.id} is successful.`,
      type: "PAYMENT",
    }),
    createNotification({
      userId: booking.providerId,
      title: "Booking paid",
      message: "A booking has been paid and is confirmed.",
      type: "PAYMENT",
    }),
  ])

  return ok({ data: payment }, 201)
}
