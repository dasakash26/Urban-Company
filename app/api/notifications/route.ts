import prisma from "@/lib/prisma"
import { ok } from "@/lib/http"
import { requireSession } from "@/lib/auth-server"
import { getPagination } from "@/lib/api-utils"

export async function GET(request: Request) {
  const authResult = await requireSession()

  if (!authResult.ok) {
    return authResult.response
  }

  const url = new URL(request.url)
  const unreadOnly = url.searchParams.get("unread") === "true"
  const { page, limit, skip } = getPagination(url.searchParams)

  const where = {
    userId: authResult.session.user.id,
    ...(unreadOnly ? { isRead: false } : {}),
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: {
        userId: authResult.session.user.id,
        isRead: false,
      },
    }),
  ])

  return ok({
    data: notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  })
}

export async function PATCH() {
  const authResult = await requireSession()

  if (!authResult.ok) {
    return authResult.response
  }

  await prisma.notification.updateMany({
    where: {
      userId: authResult.session.user.id,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  })

  return ok({ success: true })
}
