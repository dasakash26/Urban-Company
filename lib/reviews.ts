import prisma from "@/lib/prisma"

export async function refreshProviderRating(providerId: string) {
  const aggregation = await prisma.review.aggregate({
    where: {
      providerId,
      isHidden: false,
    },
    _avg: { rating: true },
    _count: { _all: true },
  })

  await prisma.providerProfile.upsert({
    where: { userId: providerId },
    create: {
      userId: providerId,
      averageRating: aggregation._avg.rating ?? 0,
      totalReviews: aggregation._count._all,
    },
    update: {
      averageRating: aggregation._avg.rating ?? 0,
      totalReviews: aggregation._count._all,
    },
  })
}
