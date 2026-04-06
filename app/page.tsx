import Link from "next/link"

import { SiteShell } from "@/components/layout/site-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession } from "@/lib/auth-server"
import { formatCurrencyINR } from "@/lib/format"
import prisma from "@/lib/prisma"

type Role = "CUSTOMER" | "PROVIDER" | "ADMIN"

function roleMessage(role: Role) {
  if (role === "PROVIDER") {
    return {
      title: "Provider workspace",
      subtitle:
        "Create services, manage booking pipeline, and grow repeat customers.",
      primaryLabel: "Go to dashboard",
      primaryHref: "/dashboard",
      secondaryLabel: "View services",
      secondaryHref: "/services",
    }
  }

  if (role === "ADMIN") {
    return {
      title: "Marketplace control",
      subtitle:
        "Monitor platform performance, user activity, and transaction health.",
      primaryLabel: "Open dashboard",
      primaryHref: "/dashboard",
      secondaryLabel: "Review bookings",
      secondaryHref: "/bookings",
    }
  }

  return {
    title: "Find the right cleaner in minutes",
    subtitle:
      "Compare trusted professionals, book instantly, and track every update in one place.",
    primaryLabel: "Browse services",
    primaryHref: "/services",
    secondaryLabel: "My bookings",
    secondaryHref: "/bookings",
  }
}

export default async function Page() {
  const session = await getSession()
  const role = (session?.user.role ?? "CUSTOMER") as Role
  const copy = roleMessage(role)

  const [serviceCount, providerCount, bookingCount, avgPrice] =
    await Promise.all([
      prisma.service.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "PROVIDER" } }),
      session
        ? prisma.booking.count({ where: { customerId: session.user.id } })
        : Promise.resolve(0),
      prisma.service.aggregate({
        _avg: { price: true },
        where: { isActive: true },
      }),
    ])

  const cards = [
    {
      title: "Active services",
      value: String(serviceCount),
      description: "Live offerings available for booking right now.",
      actionLabel: "Explore catalog",
      actionHref: "/services",
      tone: "default" as const,
    },
    {
      title: "Verified providers",
      value: String(providerCount),
      description: "Professionals currently serving across major cities.",
      actionLabel: "View providers",
      actionHref: "/services",
      tone: "default" as const,
    },
    {
      title: session ? "Your bookings" : "Average service price",
      value: session
        ? String(bookingCount)
        : `INR ${formatCurrencyINR(Number(avgPrice._avg.price ?? 0))}`,
      description: session
        ? "All bookings linked to your account."
        : "Typical marketplace pricing across active services.",
      actionLabel: session ? "Track bookings" : "Get started",
      actionHref: session ? "/bookings" : "/register",
      tone: "accent" as const,
    },
  ]

  return (
    <SiteShell>
      <section className="space-y-8">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-muted/40 p-6 sm:p-10">
          <div className="pointer-events-none absolute -top-16 -right-10 size-44 rounded-full bg-primary/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 size-36 rounded-full bg-chart-2/10 blur-2xl" />

          <div className="relative space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Urban Clean Marketplace</Badge>
              {session ? (
                <Badge>{role}</Badge>
              ) : (
                <Badge variant="outline">Guest</Badge>
              )}
            </div>

            <h1 className="max-w-4xl font-heading text-4xl leading-tight font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {copy.title}
            </h1>

            <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
              {copy.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href={copy.primaryHref}>{copy.primaryLabel}</Link>
              </Button>

              <Button asChild size="lg" variant="outline">
                <Link href={copy.secondaryHref}>{copy.secondaryLabel}</Link>
              </Button>

              {!session ? (
                <Button asChild size="lg" variant="ghost">
                  <Link href="/register">Become a provider</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {cards.map((card) => (
            <Card
              key={card.title}
              className={`transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                card.tone === "accent"
                  ? "border-primary/30 bg-primary/5"
                  : "border-border/60 bg-background/50 backdrop-blur-lg"
              }`}
            >
              <CardHeader className="space-y-3">
                <CardTitle className="text-xl tracking-tight">
                  {card.title}
                </CardTitle>
                <p className="text-4xl font-semibold tracking-tight">
                  {card.value}
                </p>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  size="sm"
                  variant={card.tone === "accent" ? "default" : "secondary"}
                >
                  <Link href={card.actionHref}>{card.actionLabel}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </SiteShell>
  )
}
