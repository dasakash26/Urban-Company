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
} from "@/components/ui/card"
import { ReviewForm } from "@/components/reviews/review-form"

type BookingItem = {
  id: string
  status: string
  scheduleAt: string
  service: {
    title: string
  }
}

export function ProfileBookings({ bookings }: { bookings: BookingItem[] }) {
  const [reviewingId, setReviewingId] = React.useState<string | null>(null)

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Recent bookings</CardTitle>
        <CardDescription>
          Track your latest requested services and leave reviews.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="rounded-xl border border-border/60 bg-muted/5 shadow-sm overflow-hidden"
          >
            <div className="p-4 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-semibold text-base">{booking.service.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-muted-foreground">{new Date(booking.scheduleAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  <Badge variant="secondary" className="text-[10px]">{booking.status}</Badge>
                </div>
              </div>

              {booking.status === "COMPLETED" && (
                <Button 
                  size="sm" 
                  variant={reviewingId === booking.id ? "secondary" : "default"}
                  onClick={() => setReviewingId(reviewingId === booking.id ? null : booking.id)}
                >
                  {reviewingId === booking.id ? "Close Form" : "Leave Review"}
                </Button>
              )}
            </div>
            
            {reviewingId === booking.id && (
              <div className="border-t border-border/40 p-4 bg-background/50 animate-in fade-in slide-in-from-top-2">
                 <ReviewForm bookingId={booking.id} onSuccess={() => setReviewingId(null)} />
              </div>
            )}
          </div>
        ))}
        {bookings.length === 0 ? (
          <p className="text-muted-foreground">No bookings yet.</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
