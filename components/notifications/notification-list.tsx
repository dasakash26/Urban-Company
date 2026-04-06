import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type NotificationItem = {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export function NotificationList({
  notifications,
}: {
  notifications: NotificationItem[]
}) {
  return (
    <div className="grid gap-3">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={notification.isRead ? "opacity-70" : ""}
        >
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base">{notification.title}</CardTitle>
              <CardDescription>
                {new Date(notification.createdAt).toLocaleString()}
              </CardDescription>
            </div>
            <Badge variant={notification.isRead ? "outline" : "default"}>
              {notification.type}
            </Badge>
          </CardHeader>
          <CardContent>{notification.message}</CardContent>
        </Card>
      ))}
      {notifications.length === 0 && (
        <Card>
          <CardContent className="text-muted-foreground">
            No notifications.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
