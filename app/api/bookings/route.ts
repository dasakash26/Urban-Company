import prisma from "@/lib/prisma"
import { fail, ok } from "@/lib/http"
import { requireRole, requireSession } from "@/lib/auth-server"
import { createNotification } from "@/lib/notifications"
import { getPagination, readJson, requireFields } from "@/lib/api-utils"

export async function GET(request: Request) {
  const authResult = await requireSession()

  if (!authResult.ok) {
    return authResult.response
  }

  const url = new URL(request.url)
  const status = url.searchParams.get("status")
  const { page, limit, skip } = getPagination(url.searchParams)
  const role = authResult.session.user.role

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(role === "CUSTOMER" ? { customerId: authResult.session.user.id } : {}),
    ...(role === "PROVIDER" ? { providerId: authResult.session.user.id } : {}),
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        service: true,
        customer: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
        payment: true,
        review: true,
      },
      orderBy: { scheduleAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ])

  return ok({
    data: bookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  })
}

type CreateBookingPayload = {
  serviceId: string
  scheduleAt: string
  address: string
  notes?: string
}

export async function POST(request: Request) {
  const authResult = await requireRole(["CUSTOMER", "ADMIN"])

  if (!authResult.ok) {
    return authResult.response
  }

  const payload = await readJson<CreateBookingPayload>(request)

  if (!payload) {
    return fail("Invalid JSON payload", 400)
  }

  const missing = requireFields(payload as Record<string, unknown>, [
    "serviceId",
    "scheduleAt",
    "address",
  ])

  if (missing) {
    return missing
  }

  const service = await prisma.service.findUnique({
    where: { id: payload.serviceId },
  })

  if (!service || !service.isActive) {
    return fail("Service unavailable", 404)
  }

  const scheduleAt = new Date(payload.scheduleAt)

  if (Number.isNaN(scheduleAt.getTime())) {
    return fail("Invalid schedule date", 400)
  }

  const booking = await prisma.booking.create({
    data: {
      serviceId: service.id,
      customerId: authResult.session.user.id,
      providerId: service.providerId,
      scheduleAt,
      address: payload.address,
      notes: payload.notes,
      totalAmount: service.price,
      status: "PENDING",
      paymentStatus: "PENDING",
    },
    include: {
      service: true,
    },
  })

  await Promise.all([
    createNotification({
      userId: service.providerId,
      title: "New booking request",
      message: `You received a new booking for ${service.title}.`,
      type: "BOOKING",
    }),
    createNotification({
      userId: authResult.session.user.id,
      title: "Booking created",
      message: `Your booking for ${service.title} is pending confirmation.`,
      type: "BOOKING",
    }),
  ])

  return ok({ data: booking }, 201)
}
