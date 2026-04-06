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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type BookingActionItem = {
  id: string
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED"
  address: string
  scheduleAt: string
  service: {
    title: string
  }
}

type BookingActionsProps = {
  bookings: BookingActionItem[]
  role: string
}

const providerStatusFlow: BookingActionItem["status"][] = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]

export function BookingActions({ bookings, role }: BookingActionsProps) {
  const [items, setItems] = React.useState(bookings)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    setItems(bookings)
  }, [bookings])

  async function updateStatus(
    bookingId: string,
    status: BookingActionItem["status"]
  ) {
    setUpdatingId(bookingId)

    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    setUpdatingId(null)

    if (!response.ok) {
      return
    }

    setItems((current) =>
      current.map((booking) =>
        booking.id === bookingId ? { ...booking, status } : booking
      )
    )
  }

  async function payNow(bookingId: string) {
    setUpdatingId(bookingId)

    const response = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, method: "mock" }),
    })

    setUpdatingId(null)

    if (!response.ok) {
      return
    }

    setItems((current) =>
      current.map((booking) =>
        booking.id === bookingId
          ? { ...booking, paymentStatus: "SUCCESS", status: "CONFIRMED" }
          : booking
      )
    )
  }

  return (
    <div className="grid gap-3">
      {items.slice(0, 8).map((booking) => (
        <Card key={booking.id} className="border-border/60">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-base">{booking.service.title}</CardTitle>
            <CardDescription>
              {new Date(booking.scheduleAt).toLocaleString()} -{" "}
              {booking.address}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{booking.status}</Badge>
              <Badge
                variant={
                  booking.paymentStatus === "SUCCESS" ? "default" : "outline"
                }
              >
                Payment: {booking.paymentStatus}
              </Badge>
            </div>

            {(role === "PROVIDER" || role === "ADMIN") && (
              <div className="grid gap-2">
                <Label htmlFor={`status-${booking.id}`}>Update status</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={booking.status}
                    onValueChange={(value) => {
                      void updateStatus(
                        booking.id,
                        value as BookingActionItem["status"]
                      )
                    }}
                    disabled={updatingId === booking.id}
                  >
                    <SelectTrigger id={`status-${booking.id}`} className="w-[140px] text-xs h-8">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {providerStatusFlow.map((statusOption) => (
                        <SelectItem key={statusOption} value={statusOption} className="text-xs">
                          {statusOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {role === "CUSTOMER" && booking.paymentStatus !== "SUCCESS" ? (
              <Button
                size="sm"
                onClick={() => {
                  void payNow(booking.id)
                }}
                disabled={updatingId === booking.id}
              >
                {updatingId === booking.id ? "Processing..." : "Pay now"}
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ))}
      {items.length === 0 ? (
        <Card>
          <CardContent className="text-sm text-muted-foreground">
            No bookings to manage.
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
