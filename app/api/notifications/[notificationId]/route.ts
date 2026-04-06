import prisma from "@/lib/prisma"
import { fail, ok } from "@/lib/http"
import { requireSession } from "@/lib/auth-server"
import { resolveParams } from "@/lib/route-params"

type Params = { notificationId: string }

export async function PATCH(
  _request: Request,
  context: { params: Promise<Params> | Params }
) {
  const authResult = await requireSession()

  if (!authResult.ok) {
    return authResult.response
  }

  const { notificationId } = await resolveParams(context.params)

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  })

  if (!notification) {
    return fail("Notification not found", 404)
  }

  if (
    notification.userId !== authResult.session.user.id &&
    authResult.session.user.role !== "ADMIN"
  ) {
    return fail("Forbidden", 403)
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  })

  return ok({ data: updated })
}
