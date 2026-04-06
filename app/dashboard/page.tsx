import { SiteShell } from "@/components/layout/site-shell"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProviderProfileForm } from "@/components/providers/provider-profile-form"
import { ServiceForm } from "@/components/services/service-form"
import { NotificationList } from "@/components/notifications/notification-list"
import { getSession } from "@/lib/auth-server"
import { getDashboardData } from "@/lib/dashboard"
import prisma from "@/lib/prisma"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    return (
      <SiteShell>
        <Card>
          <CardContent className="text-muted-foreground">
            Please login to view the dashboard.
          </CardContent>
        </Card>
      </SiteShell>
    )
  }

  const [dashboard, notifications, providerProfile] = await Promise.all([
    getDashboardData(session.user.id, session.user.role),
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.providerProfile.findUnique({
      where: { userId: session.user.id },
    }),
  ])

  const stats = Object.entries(dashboard.stats).map(([label, value]) => ({
    label,
    value,
  }))

  return (
    <SiteShell>
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Role-aware analytics and management tools for your account.
          </p>
        </div>

        <StatsGrid stats={stats} />

        <div className="grid gap-4 lg:grid-cols-2">
          {session.user.role === "PROVIDER" || session.user.role === "ADMIN" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Provider profile</CardTitle>
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
          ) : null}

          {session.user.role === "PROVIDER" || session.user.role === "ADMIN" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create service</CardTitle>
              </CardHeader>
              <CardContent>
                <ServiceForm />
              </CardContent>
            </Card>
          ) : null}

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Recent notifications</CardTitle>
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
      </section>
    </SiteShell>
  )
}
