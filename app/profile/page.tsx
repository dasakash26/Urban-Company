import { SiteShell } from "@/components/layout/site-shell"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSession } from "@/lib/auth-server"
import prisma from "@/lib/prisma"

export default async function ProfilePage() {
  const session = await getSession()

  if (!session) {
    return (
      <SiteShell>
        <Card>
          <CardContent className="text-muted-foreground">
            Please login to view your profile.
          </CardContent>
        </Card>
      </SiteShell>
    )
  }

  const [providerProfile, recentBookings, recentReviews] = await Promise.all([
    prisma.providerProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.booking.findMany({
      where: {
        OR: [{ customerId: session.user.id }, { providerId: session.user.id }],
      },
      include: {
        service: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.review.findMany({
      where: {
        OR: [{ customerId: session.user.id }, { providerId: session.user.id }],
      },
      include: {
        service: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  return (
    <SiteShell>
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Profile
          </h1>
          <p className="text-muted-foreground">
            Account details, role info, and recent activity snapshot.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{session.user.name ?? "Unnamed user"}</CardTitle>
            <CardDescription>{session.user.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge>{session.user.role}</Badge>
            <Badge
              variant={session.user.emailVerified ? "secondary" : "outline"}
            >
              {session.user.emailVerified
                ? "Email verified"
                : "Email not verified"}
            </Badge>
          </CardContent>
        </Card>

        {providerProfile ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Provider profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>Bio: {providerProfile.bio ?? "-"}</p>
              <p>Experience: {providerProfile.experience} years</p>
              <p>Service area: {providerProfile.serviceArea ?? "-"}</p>
              <p>
                Rating: {providerProfile.averageRating?.toString() ?? "0"} (
                {providerProfile.totalReviews} reviews)
              </p>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent bookings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="rounded-md border p-3">
                  <p className="font-medium">{booking.service.title}</p>
                  <p className="text-muted-foreground">{booking.status}</p>
                </div>
              ))}
              {recentBookings.length === 0 ? (
                <p className="text-muted-foreground">No bookings yet.</p>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {recentReviews.map((review) => (
                <div key={review.id} className="rounded-md border p-3">
                  <p className="font-medium">{review.service.title}</p>
                  <p className="text-muted-foreground">{review.rating}/5</p>
                </div>
              ))}
              {recentReviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet.</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteShell>
  )
}
