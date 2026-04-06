import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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

export function BookingList({ bookings }: { bookings: BookingItem[] }) {
  return (
    <div className="grid gap-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base">
                {booking.service?.title ?? "Cleaning service"}
              </CardTitle>
              <CardDescription>
                {new Date(booking.scheduleAt).toLocaleString()} -{" "}
                {booking.address}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{booking.status}</Badge>
              <Badge
                variant={
                  booking.paymentStatus === "SUCCESS" ? "default" : "outline"
                }
              >
                {booking.paymentStatus}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-sm font-medium">
            INR {booking.totalAmount.toFixed(2)}
          </CardContent>
        </Card>
      ))}
      {bookings.length === 0 && (
        <Card>
          <CardContent className="text-muted-foreground">
            No bookings found.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
