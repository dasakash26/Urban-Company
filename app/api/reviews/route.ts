import prisma from "@/lib/prisma"
import { fail, ok } from "@/lib/http"
import { requireRole } from "@/lib/auth-server"
import { readJson, requireFields, getPagination } from "@/lib/api-utils"
import { refreshProviderRating } from "@/lib/reviews"
import { createNotification } from "@/lib/notifications"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const serviceId = url.searchParams.get("serviceId")
  const providerId = url.searchParams.get("providerId")
  const includeHidden = url.searchParams.get("includeHidden") === "true"
  const { page, limit, skip } = getPagination(url.searchParams)

  const where = {
    ...(serviceId ? { serviceId } : {}),
    ...(providerId ? { providerId } : {}),
    ...(includeHidden ? {} : { isHidden: false }),
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
  ])

  return ok({
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  })
}

type CreateReviewPayload = {
  bookingId: string
  rating: number
  comment?: string
}

export async function POST(request: Request) {
  const authResult = await requireRole(["CUSTOMER", "ADMIN"])

  if (!authResult.ok) {
    return authResult.response
  }

  const payload = await readJson<CreateReviewPayload>(request)

  if (!payload) {
    return fail("Invalid JSON payload", 400)
  }

  const missing = requireFields(payload as Record<string, unknown>, [
    "bookingId",
    "rating",
  ])

  if (missing) {
    return missing
  }

  if (payload.rating < 1 || payload.rating > 5) {
    return fail("Rating must be between 1 and 5", 400)
  }

  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: {
      service: true,
    },
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

  if (booking.status !== "COMPLETED") {
    return fail("Reviews can only be created for completed bookings", 400)
  }

  const existingReview = await prisma.review.findUnique({
    where: { bookingId: booking.id },
  })

  if (existingReview) {
    return fail("Review already exists for this booking", 409)
  }

  const review = await prisma.review.create({
    data: {
      bookingId: booking.id,
      serviceId: booking.serviceId,
      customerId: authResult.session.user.id,
      providerId: booking.providerId,
      rating: payload.rating,
      comment: payload.comment,
    },
  })

  await Promise.all([
    refreshProviderRating(booking.providerId),
    createNotification({
      userId: booking.providerId,
      title: "New review received",
      message: `You received a ${payload.rating}-star review for ${booking.service.title}.`,
      type: "REVIEW",
    }),
  ])

  return ok({ data: review }, 201)
}
