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
  const [items, setItems] = React.useState(notifications)
  const [markingAll, setMarkingAll] = React.useState(false)

  React.useEffect(() => {
    setItems(notifications)
  }, [notifications])

  async function markAllAsRead() {
    setMarkingAll(true)

    const response = await fetch("/api/notifications", {
      method: "PATCH",
    })

    if (response.ok) {
      setItems((current) =>
        current.map((notification) => ({ ...notification, isRead: true }))
      )
    }

    setMarkingAll(false)
  }

  async function markOneAsRead(notificationId: string) {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: "PATCH",
    })

    if (!response.ok) {
      return
    }

    setItems((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  return (
    <div className="grid gap-3">
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          disabled={markingAll || items.length === 0}
          onClick={markAllAsRead}
        >
          {markingAll ? "Marking..." : "Mark all read"}
        </Button>
      </div>
      {items.map((notification) => (
        <Card
          key={notification.id}
          className={notification.isRead ? "opacity-70" : "border-primary/30"}
        >
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base">{notification.title}</CardTitle>
              <CardDescription>
                {new Date(notification.createdAt).toLocaleString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={notification.isRead ? "outline" : "default"}>
                {notification.type}
              </Badge>
              {!notification.isRead ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => markOneAsRead(notification.id)}
                >
                  Mark read
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>{notification.message}</CardContent>
        </Card>
      ))}
      {items.length === 0 && (
        <Card>
          <CardContent className="text-muted-foreground">
            No notifications.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
