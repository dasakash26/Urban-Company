import prisma from "@/lib/prisma"

export async function getDashboardData(userId: string, role: string) {
  if (role === "ADMIN") {
    const [services, bookings, users, pendingBookings, payments] =
      await Promise.all([
        prisma.service.count(),
        prisma.booking.count(),
        prisma.user.count(),
        prisma.booking.count({ where: { status: "PENDING" } }),
        prisma.payment.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            status: "SUCCESS",
          },
        }),
      ])

    return {
      stats: {
        totalServices: services,
        totalBookings: bookings,
        totalUsers: users,
        pendingBookings,
        grossRevenue: Number(payments._sum.amount ?? 0),
      },
    }
  }

  if (role === "PROVIDER") {
    const [
      services,
      totalBookings,
      upcomingBookings,
      completedBookings,
      earnings,
    ] = await Promise.all([
      prisma.service.count({ where: { providerId: userId } }),
      prisma.booking.count({ where: { providerId: userId } }),
      prisma.booking.count({
        where: {
          providerId: userId,
          status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
        },
      }),
      prisma.booking.count({
        where: {
          providerId: userId,
          status: "COMPLETED",
        },
      }),
      prisma.payment.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          providerId: userId,
          status: "SUCCESS",
        },
      }),
    ])

    return {
      stats: {
        totalServices: services,
        totalBookings,
        upcomingBookings,
        completedBookings,
        earnings: Number(earnings._sum.amount ?? 0),
      },
    }
  }

  const [totalBookings, upcomingBookings, completedBookings, spent] =
    await Promise.all([
      prisma.booking.count({ where: { customerId: userId } }),
      prisma.booking.count({
        where: {
          customerId: userId,
          status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
        },
      }),
      prisma.booking.count({
        where: {
          customerId: userId,
          status: "COMPLETED",
        },
      }),
      prisma.payment.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          customerId: userId,
          status: "SUCCESS",
        },
      }),
    ])

  return {
    stats: {
      totalBookings,
      upcomingBookings,
      completedBookings,
      totalSpent: Number(spent._sum.amount ?? 0),
    },
  }
}
