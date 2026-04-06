import prisma from "@/lib/prisma"
import { fail, ok } from "@/lib/http"
import { requireSession } from "@/lib/auth-server"
import { readJson } from "@/lib/api-utils"
import { refreshProviderRating } from "@/lib/reviews"
import { resolveParams } from "@/lib/route-params"

type Params = { reviewId: string }

export async function PATCH(
  request: Request,
  context: { params: Promise<Params> | Params }
) {
  const authResult = await requireSession()

  if (!authResult.ok) {
    return authResult.response
  }

  const { reviewId } = await resolveParams(context.params)

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  })

  if (!review) {
    return fail("Review not found", 404)
  }

  const role = authResult.session.user.role
  const userId = authResult.session.user.id
  const isAdmin = role === "ADMIN"
  const isOwner = review.customerId === userId

  if (!isAdmin && !isOwner) {
    return fail("Forbidden", 403)
  }

  const payload = await readJson<{ comment?: string; isHidden?: boolean }>(
    request
  )

  if (!payload) {
    return fail("Invalid JSON payload", 400)
  }

  if (!isAdmin && payload.isHidden !== undefined) {
    return fail("Only admins can moderate reviews", 403)
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(payload.comment !== undefined ? { comment: payload.comment } : {}),
      ...(payload.isHidden !== undefined ? { isHidden: payload.isHidden } : {}),
    },
  })

  await refreshProviderRating(updated.providerId)

  return ok({ data: updated })
}
