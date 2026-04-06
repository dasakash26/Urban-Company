import Link from "next/link"

import { BookingActions } from "@/components/dashboard/booking-actions"
import { RecentServices } from "@/components/dashboard/recent-services"
import { StatsGrid, type StatItem } from "@/components/dashboard/stats-grid"
import { SiteShell } from "@/components/layout/site-shell"
import { NotificationList } from "@/components/notifications/notification-list"
import { ProviderProfileForm } from "@/components/providers/provider-profile-form"
import { ServiceForm } from "@/components/services/service-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrencyINR } from "@/lib/format"
import { getSession } from "@/lib/auth-server"
import prisma from "@/lib/prisma"

function toLabel(input: string) {
  return input
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim()
}

function roleCopy(role: string) {
  if (role === "ADMIN") {
    return {
      title: "Platform command center",
      subtitle:
        "Monitor marketplace health, service supply, and transaction flow.",
    }
  }

  if (role === "PROVIDER") {
    return {
      title: "Provider operations hub",
      subtitle:
        "Manage your profile, service catalog, and active bookings in one place.",
    }
  }

  return {
    title: "Customer dashboard",
    subtitle:
      "Track bookings, payments, and updates for every cleaning request.",
  }
}

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    return (
      <SiteShell>
        <Card className="mx-auto max-w-lg border-border/60">
          <CardHeader>
            <CardTitle>Login required</CardTitle>
            <CardDescription>
              Sign in to access your personalized dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login">Go to login</Link>
            </Button>
          </CardContent>
        </Card>
      </SiteShell>
    )
  }

  const userId = session.user.id
  const role = session.user.role

  const [
    notifications,
    providerProfile,
    recentBookings,
    providerServices,
    statsRaw,
  ] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.providerProfile.findUnique({ where: { userId } }),
    prisma.booking.findMany({
      where:
        role === "ADMIN"
          ? {}
          : role === "PROVIDER"
            ? { providerId: userId }
            : { customerId: userId },
      include: {
        service: { select: { title: true } },
      },
      orderBy: { scheduleAt: "desc" },
      take: 12,
    }),
    role === "PROVIDER" || role === "ADMIN"
      ? prisma.service.findMany({
          where: role === "PROVIDER" ? { providerId: userId } : {},
          orderBy: { createdAt: "desc" },
          take: 12,
        })
      : Promise.resolve([]),
    (async () => {
      if (role === "ADMIN") {
        const [
          totalServices,
          totalBookings,
          totalUsers,
          pendingBookings,
          grossRevenue,
        ] = await Promise.all([
          prisma.service.count(),
          prisma.booking.count(),
          prisma.user.count(),
          prisma.booking.count({ where: { status: "PENDING" } }),
          prisma.payment.aggregate({
            where: { status: "SUCCESS" },
            _sum: { amount: true },
          }),
        ])

        return {
          totalServices,
          totalBookings,
          totalUsers,
          pendingBookings,
          grossRevenue: Number(grossRevenue._sum.amount ?? 0),
        }
      }

      if (role === "PROVIDER") {
        const [
          totalServices,
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
            where: { providerId: userId, status: "COMPLETED" },
          }),
          prisma.payment.aggregate({
            where: { providerId: userId, status: "SUCCESS" },
            _sum: { amount: true },
          }),
        ])

        return {
          totalServices,
          totalBookings,
          upcomingBookings,
          completedBookings,
          earnings: Number(earnings._sum.amount ?? 0),
        }
      }

      const [totalBookings, upcomingBookings, completedBookings, totalSpent] =
        await Promise.all([
          prisma.booking.count({ where: { customerId: userId } }),
          prisma.booking.count({
            where: {
              customerId: userId,
              status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
            },
          }),
          prisma.booking.count({
            where: { customerId: userId, status: "COMPLETED" },
          }),
          prisma.payment.aggregate({
            where: { customerId: userId, status: "SUCCESS" },
            _sum: { amount: true },
          }),
        ])

      return {
        totalBookings,
        upcomingBookings,
        completedBookings,
        totalSpent: Number(totalSpent._sum.amount ?? 0),
      }
    })(),
  ])

  const statEntries = Object.entries(statsRaw)
  const providerServicesForUi = providerServices.map((service) => ({
    id: service.id,
    title: service.title,
    category: service.category,
    city: service.city,
    price: Number(service.price),
    isActive: service.isActive,
  }))

  const stats: StatItem[] = statEntries.map(([key, value], index) => ({
    label: toLabel(key),
    value:
      key.toLowerCase().includes("revenue") ||
      key.toLowerCase().includes("earnings") ||
      key.toLowerCase().includes("spent")
        ? `INR ${formatCurrencyINR(value)}`
        : (value as string | number),
    tone: index === 0 ? "accent" : "default",
    hint:
      key === "pendingBookings"
        ? "Requires operational attention"
        : key === "upcomingBookings"
          ? "Scheduled and active pipeline"
          : undefined,
  }))

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length
  const copy = roleCopy(role)

  return (
    <SiteShell>
      <section className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/40 p-6">
          <div className="pointer-events-none absolute -top-14 -right-14 size-44 rounded-full bg-primary/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-8 size-36 rounded-full bg-chart-2/10 blur-2xl" />
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{role}</Badge>
              <Badge variant={unreadCount > 0 ? "default" : "outline"}>
                {unreadCount} unread notifications
              </Badge>
            </div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {copy.title}
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
              {copy.subtitle}
            </p>
          </div>
        </div>

        <StatsGrid stats={stats} />

        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="border-border/60 bg-background/50 backdrop-blur-md shadow-sm xl:col-span-2">
            <CardHeader>
              <CardTitle>Bookings workflow</CardTitle>
              <CardDescription>
                {role === "CUSTOMER"
                  ? "Pay for bookings and track status changes in real-time."
                  : "Update booking status and keep service operations moving."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingActions
                role={role}
                bookings={recentBookings.map((booking) => ({
                  id: booking.id,
                  status: booking.status,
                  paymentStatus: booking.paymentStatus,
                  address: booking.address,
                  scheduleAt: booking.scheduleAt.toISOString(),
                  service: booking.service,
                }))}
              />
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/50 backdrop-blur-md shadow-sm">
            <CardHeader>
              <CardTitle>Recent notifications</CardTitle>
              <CardDescription>
                Stay updated on booking, payment, and review events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationList
                notifications={notifications.map((notification) => ({
                  ...notification,
                  createdAt: notification.createdAt.toISOString(),
                }))}
              />
            </CardContent>
          </Card>
        </div>

        {(role === "PROVIDER" || role === "ADMIN") && (
          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="border-border/60 bg-background/50 backdrop-blur-md shadow-sm xl:col-span-1">
              <CardHeader>
                <CardTitle>Provider profile</CardTitle>
                <CardDescription>
                  Keep service area and experience details updated.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProviderProfileForm
                  initialValues={{
                    bio: providerProfile?.bio,
                    experience: providerProfile?.experience,
                    serviceArea: providerProfile?.serviceArea,
                  }}
                />
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-background/50 backdrop-blur-md shadow-sm xl:col-span-1">
              <CardHeader>
                <CardTitle>Create new service</CardTitle>
                <CardDescription>
                  Add and publish new cleaning offerings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ServiceForm />
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-background/50 backdrop-blur-md shadow-sm xl:col-span-1">
              <CardHeader>
                <CardTitle>Recent services</CardTitle>
                <CardDescription>
                  Quick view of your latest catalog entries.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentServices services={providerServicesForUi} />
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </SiteShell>
  )
}
