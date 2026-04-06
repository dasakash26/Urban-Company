import prisma from "@/lib/prisma"

type CreateNotificationInput = {
  userId: string
  title: string
  message: string
  type?: "BOOKING" | "PAYMENT" | "REVIEW" | "SYSTEM"
}

export async function createNotification(input: CreateNotificationInput) {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type ?? "SYSTEM",
    },
  })
}
