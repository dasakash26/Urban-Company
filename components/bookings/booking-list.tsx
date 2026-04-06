"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { formatCurrencyINR } from "@/lib/format"
import { ReviewForm } from "@/components/reviews/review-form"

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

export function BookingList({ bookings, onUpdate }: { bookings: BookingItem[], onUpdate?: () => void }) {
  const [payingId, setPayingId] = React.useState<string | null>(null)
  const [reviewingId, setReviewingId] = React.useState<string | null>(null)

  async function payForBooking(bookingId: string) {
    setPayingId(bookingId)
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })
      
      if (response.ok && onUpdate) {
        onUpdate()
      } else {
        alert("Payment failed.")
      }
    } catch {
      alert("Payment failed.")
    } finally {
      setPayingId(null)
    }
  }

  return (
    <div className="grid gap-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 bg-muted/10 pb-4 border-b border-border/30">
            <div>
              <CardTitle className="text-xl font-heading tracking-tight text-primary">
                {booking.service?.title ?? "Cleaning service"}
              </CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-2 mt-2">
                <span className="font-medium text-foreground/80">{new Date(booking.scheduleAt).toLocaleString()}</span>
                <span className="text-muted-foreground hidden sm:inline">&bull;</span>
                <span className="text-muted-foreground">{booking.address}</span>
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 items-end shrink-0">
              <Badge variant={booking.status === "COMPLETED" ? "default" : "secondary"} className="shadow-sm">Order: {booking.status}</Badge>
              <Badge
                variant={
                  booking.paymentStatus === "SUCCESS" ? "default" : "outline"
                }
                className={booking.paymentStatus === "SUCCESS" ? "bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/20 shadow-sm" : "shadow-sm"}
              >
                Payment: {booking.paymentStatus}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-lg font-semibold pt-4">
            Total: <span className="text-muted-foreground font-normal">INR {formatCurrencyINR(booking.totalAmount)}</span>
          </CardContent>
          
          {(booking.paymentStatus !== "SUCCESS" || booking.status === "COMPLETED") && booking.status !== "CANCELLED" && (
            <CardFooter className="flex flex-wrap items-center gap-3 pt-2 pb-4">
              {booking.paymentStatus !== "SUCCESS" && (
                <Button size="sm" onClick={() => payForBooking(booking.id)} disabled={payingId === booking.id} className="shadow-sm">
                  {payingId === booking.id ? "Processing..." : "Pay now"}
                </Button>
              )}
              
              {booking.status === "COMPLETED" && (
                <Button size="sm" variant={reviewingId === booking.id ? "secondary" : "outline"} onClick={() => setReviewingId(reviewingId === booking.id ? null : booking.id)}>
                  {reviewingId === booking.id ? "Close Review" : "Leave a Review"}
                </Button>
              )}
            </CardFooter>
          )}

          {reviewingId === booking.id && (
            <div className="border-t border-border/40 p-4 bg-muted/5 animate-in fade-in slide-in-from-top-2">
               <ReviewForm bookingId={booking.id} />
            </div>
          )}
        </Card>
      ))}
      {bookings.length === 0 && (
        <Card className="border-dashed border-2 bg-transparent shadow-none">
          <CardContent className="text-muted-foreground py-10 text-center flex flex-col items-center justify-center gap-2">
             <span className="text-lg font-medium text-foreground">No bookings found</span>
             <span>Try adjusting your filters or book a new service.</span>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
