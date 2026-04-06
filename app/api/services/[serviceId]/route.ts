import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/auth-server"
import { fail, ok } from "@/lib/http"
import { readJson } from "@/lib/api-utils"
import { resolveParams } from "@/lib/route-params"

type Params = { serviceId: string }

export async function GET(
  _request: Request,
  context: { params: Promise<Params> | Params }
) {
  const { serviceId } = await resolveParams(context.params)

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          image: true,
          providerProfile: true,
        },
      },
      reviews: {
        where: { isHidden: false },
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: { id: true, name: true, image: true },
          },
        },
      },
    },
  })

  if (!service) {
    return fail("Service not found", 404)
  }

  return ok({ data: service })
}

type UpdateServicePayload = {
  title?: string
  description?: string
  category?: string
  city?: string
  price?: number
  durationMinutes?: number
  isActive?: boolean
}

export async function PATCH(
  request: Request,
  context: { params: Promise<Params> | Params }
) {
  const authResult = await requireRole(["PROVIDER", "ADMIN"])

  if (!authResult.ok) {
    return authResult.response
  }

  const { serviceId } = await resolveParams(context.params)
  const payload = await readJson<UpdateServicePayload>(request)

  if (!payload) {
    return fail("Invalid JSON payload", 400)
  }

  const existing = await prisma.service.findUnique({ where: { id: serviceId } })

  if (!existing) {
    return fail("Service not found", 404)
  }

  const isOwner = existing.providerId === authResult.session.user.id
  const isAdmin = authResult.session.user.role === "ADMIN"

  if (!isOwner && !isAdmin) {
    return fail("Forbidden", 403)
  }

  const updated = await prisma.service.update({
    where: { id: serviceId },
    data: payload,
  })

  return ok({ data: updated })
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<Params> | Params }
) {
  const authResult = await requireRole(["PROVIDER", "ADMIN"])

  if (!authResult.ok) {
    return authResult.response
  }

  const { serviceId } = await resolveParams(context.params)
  const existing = await prisma.service.findUnique({ where: { id: serviceId } })

  if (!existing) {
    return fail("Service not found", 404)
  }

  const isOwner = existing.providerId === authResult.session.user.id
  const isAdmin = authResult.session.user.role === "ADMIN"

  if (!isOwner && !isAdmin) {
    return fail("Forbidden", 403)
  }

  await prisma.service.delete({ where: { id: serviceId } })

  return ok({ success: true })
}
