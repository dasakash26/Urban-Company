import prisma from "@/lib/prisma"
import { fail, ok } from "@/lib/http"
import { requireSession } from "@/lib/auth-server"
import { resolveParams } from "@/lib/route-params"

type Params = { paymentId: string }

export async function GET(
  _request: Request,
  context: { params: Promise<Params> | Params }
) {
  const authResult = await requireSession()

  if (!authResult.ok) {
    return authResult.response
  }

  const { paymentId } = await resolveParams(context.params)

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          service: true,
        },
      },
    },
  })

  if (!payment) {
    return fail("Payment not found", 404)
  }

  const role = authResult.session.user.role
  const userId = authResult.session.user.id
  const canView =
    role === "ADMIN" ||
    payment.customerId === userId ||
    payment.providerId === userId

  if (!canView) {
    return fail("Forbidden", 403)
  }

  return ok({ data: payment })
}
