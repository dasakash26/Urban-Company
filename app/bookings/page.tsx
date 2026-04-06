"use client"

import * as React from "react"

import { SiteShell } from "@/components/layout/site-shell"
import { BookingList } from "@/components/bookings/booking-list"
import { ReviewForm } from "@/components/reviews/review-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type BookingItem = {
  id: string
  status: string
  paymentStatus: string
  scheduleAt: string
  address: string
  totalAmount: number
  service?: {
    title: string
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = React.useState<BookingItem[]>([])
  const [status, setStatus] = React.useState("")
  const [bookingIdForReview, setBookingIdForReview] = React.useState("")
  const [bookingIdForPayment, setBookingIdForPayment] = React.useState("")
  const [message, setMessage] = React.useState<string | null>(null)

  const query = React.useMemo(() => {
    const params = new URLSearchParams()
    if (status) params.set("status", status)
    return params.toString()
  }, [status])

  const loadBookings = React.useCallback(async () => {
    const response = await fetch(`/api/bookings${query ? `?${query}` : ""}`)

    if (!response.ok) {
      return
    }

    const payload = (await response.json()) as { data: BookingItem[] }
    setBookings(payload.data)
  }, [query])

  React.useEffect(() => {
    void loadBookings()
  }, [loadBookings])

  async function payForBooking() {
    setMessage(null)

    const response = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: bookingIdForPayment }),
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      setMessage(payload?.error ?? "Payment failed")
      return
    }

    setMessage("Payment recorded successfully")
    setBookingIdForPayment("")
    await loadBookings()
  }

  return (
    <SiteShell>
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Bookings
          </h1>
          <p className="text-muted-foreground">
            Track bookings, submit reviews, and complete mock payments.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter bookings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:max-w-xs">
            <Label htmlFor="status">Status</Label>
            <Input
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              placeholder="PENDING"
            />
          </CardContent>
        </Card>

        <BookingList bookings={bookings} />

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pay for booking</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="paymentBookingId">Booking ID</Label>
                <Input
                  id="paymentBookingId"
                  value={bookingIdForPayment}
                  onChange={(event) =>
                    setBookingIdForPayment(event.target.value)
                  }
                />
              </div>
              <Button onClick={payForBooking}>Pay now (mock)</Button>
              {message ? (
                <p className="text-sm text-muted-foreground">{message}</p>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submit review</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="reviewBookingId">Booking ID</Label>
                <Input
                  id="reviewBookingId"
                  value={bookingIdForReview}
                  onChange={(event) =>
                    setBookingIdForReview(event.target.value)
                  }
                />
              </div>
              {bookingIdForReview ? (
                <ReviewForm bookingId={bookingIdForReview} />
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteShell>
  )
}
