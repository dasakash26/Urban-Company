import Link from "next/link"

import { SiteShell } from "@/components/layout/site-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Page() {
  return (
    <SiteShell>
      <section className="space-y-8">
        <div className="space-y-4">
          <h1 className="font-heading text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
            Book trusted home cleaning in minutes
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            Urban Clean connects customers with verified cleaning professionals
            in a self-service marketplace with bookings, ratings, provider
            dashboards, notifications, and payment tracking.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/services">Browse services</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/register">Become a provider</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Service Catalog</CardTitle>
              <CardDescription>
                Explore local cleaning options by city and category.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" size="sm">
                <Link href="/services">Explore</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Smart Booking</CardTitle>
              <CardDescription>
                Schedule cleanings and track every booking status update.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" size="sm">
                <Link href="/bookings">View bookings</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Provider Dashboard</CardTitle>
              <CardDescription>
                Manage services, earnings, and customer reviews.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" size="sm">
                <Link href="/dashboard">Open dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteShell>
  )
}
