import prisma from "@/lib/prisma"
import { fail, ok } from "@/lib/http"
import { resolveParams } from "@/lib/route-params"

type Params = { providerId: string }

export async function GET(
  _request: Request,
  context: { params: Promise<Params> | Params }
) {
  const { providerId } = await resolveParams(context.params)

  const provider = await prisma.user.findFirst({
    where: {
      id: providerId,
      role: "PROVIDER",
    },
    include: {
      providerProfile: true,
      services: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!provider) {
    return fail("Provider not found", 404)
  }

  return ok({ data: provider })
}
