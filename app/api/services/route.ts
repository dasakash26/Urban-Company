import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/auth-server"
import { fail, ok } from "@/lib/http"
import { getPagination, readJson, requireFields } from "@/lib/api-utils"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const category = url.searchParams.get("category")
  const city = url.searchParams.get("city")
  const search = url.searchParams.get("search")
  const providerId = url.searchParams.get("providerId")
  const { skip, limit, page } = getPagination(url.searchParams)

  const where = {
    isActive: true,
    ...(category ? { category } : {}),
    ...(city ? { city } : {}),
    ...(providerId ? { providerId } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            image: true,
            providerProfile: {
              select: {
                averageRating: true,
                totalReviews: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.service.count({ where }),
  ])

  return ok({
    data: services,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  })
}

type CreateServicePayload = {
  title: string
  description: string
  category: string
  price: number
  durationMinutes: number
  city: string
}

export async function POST(request: Request) {
  const authResult = await requireRole(["PROVIDER", "ADMIN"])

  if (!authResult.ok) {
    return authResult.response
  }

  const payload = await readJson<CreateServicePayload>(request)

  if (!payload) {
    return fail("Invalid JSON payload", 400)
  }

  const missing = requireFields(payload as Record<string, unknown>, [
    "title",
    "description",
    "category",
    "price",
    "durationMinutes",
    "city",
  ])

  if (missing) {
    return missing
  }

  if (Number(payload.price) <= 0 || Number(payload.durationMinutes) <= 0) {
    return fail("Price and duration must be positive values", 400)
  }

  const service = await prisma.service.create({
    data: {
      providerId: authResult.session.user.id,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      city: payload.city,
      price: payload.price,
      durationMinutes: payload.durationMinutes,
    },
  })

  await prisma.providerProfile.upsert({
    where: { userId: authResult.session.user.id },
    update: {},
    create: { userId: authResult.session.user.id },
  })

  return ok({ data: service }, 201)
}
