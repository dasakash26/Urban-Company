import prisma from "@/lib/prisma"
import { fail, ok } from "@/lib/http"
import { requireSession } from "@/lib/auth-server"
import { getPagination } from "@/lib/api-utils"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const search = url.searchParams.get("search")
  const city = url.searchParams.get("city")
  const { page, limit, skip } = getPagination(url.searchParams)

  const where = {
    role: "PROVIDER" as const,
    ...(search
      ? {
          OR: [{ name: { contains: search, mode: "insensitive" as const } }],
        }
      : {}),
    ...(city
      ? {
          services: {
            some: {
              city,
              isActive: true,
            },
          },
        }
      : {}),
  }

  const [providers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        providerProfile: true,
        services: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            category: true,
            city: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return ok({
    data: providers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  })
}

type UpsertProviderProfilePayload = {
  bio?: string
  experience?: number
  serviceArea?: string
}

export async function POST(request: Request) {
  const authResult = await requireSession()

  if (!authResult.ok) {
    return authResult.response
  }

  if (!["PROVIDER", "ADMIN"].includes(authResult.session.user.role)) {
    return fail("Only providers can manage provider profiles", 403)
  }

  const payload = (await request
    .json()
    .catch(() => null)) as UpsertProviderProfilePayload | null

  if (!payload) {
    return fail("Invalid JSON payload", 400)
  }

  const profile = await prisma.providerProfile.upsert({
    where: { userId: authResult.session.user.id },
    create: {
      userId: authResult.session.user.id,
      bio: payload.bio,
      experience: payload.experience ?? 0,
      serviceArea: payload.serviceArea,
    },
    update: {
      ...(payload.bio !== undefined ? { bio: payload.bio } : {}),
      ...(payload.experience !== undefined
        ? { experience: payload.experience }
        : {}),
      ...(payload.serviceArea !== undefined
        ? { serviceArea: payload.serviceArea }
        : {}),
    },
  })

  return ok({ data: profile })
}
