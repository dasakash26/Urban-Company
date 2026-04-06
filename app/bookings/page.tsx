"use client"

import * as React from "react"

import { BookingList } from "@/components/bookings/booking-list"
import { SiteShell } from "@/components/layout/site-shell"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type BookingItem = {
  id: string
  status: string
  paymentStatus: string
  scheduleAt: string
  address: string
  totalAmount: number | string
  service?: {
    title: string
  }
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
]

export default function BookingsPage() {
  const [bookings, setBookings] = React.useState<BookingItem[]>([])
  const [status, setStatus] = React.useState("ALL")
  const [loading, setLoading] = React.useState(true)

  const query = React.useMemo(() => {
    const params = new URLSearchParams()
    if (status && status !== "ALL") params.set("status", status)
    return params.toString()
  }, [status])

  const loadBookings = React.useCallback(async () => {
    setLoading(true)
    const response = await fetch(query ? `/api/bookings?${query}` : "/api/bookings")

    if (response.ok) {
      const payload = (await response.json()) as { data: BookingItem[] }
      setBookings(payload.data)
    }
    setLoading(false)
  }, [query])

  React.useEffect(() => {
    void loadBookings()
  }, [loadBookings])

  return (
    <SiteShell>
      <section className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/40 p-6">
          <div className="pointer-events-none absolute -top-14 -right-10 size-40 rounded-full bg-primary/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-14 -left-10 size-40 rounded-full bg-chart-1/10 blur-2xl" />
          
          <div className="space-y-3 relative">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Bookings Hub</Badge>
              <Badge variant="outline">{bookings.length} items</Badge>
            </div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Track bookings with less friction
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
              Filter status, pay pending bookings, and submit reviews from one
              optimized workflow.
            </p>
          </div>
        </div>

        <Card className="border-border/60 bg-background/50 backdrop-blur-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Filter bookings</CardTitle>
            <CardDescription>
              Select a status to narrow down your results.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 md:max-w-xs">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {loading ? (
          <Card className="border-border/60">
            <CardContent className="py-8 text-center text-sm text-muted-foreground animate-pulse">
              Loading bookings...
            </CardContent>
          </Card>
        ) : (
          <BookingList bookings={bookings} onUpdate={loadBookings} />
        )}
      </section>
    </SiteShell>
  )
}
