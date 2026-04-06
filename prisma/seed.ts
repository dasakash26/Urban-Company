import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "../app/generated/prisma/client"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

const ids = {
  customer: "seed-customer-1",
  provider1: "seed-provider-1",
  provider2: "seed-provider-2",
  admin: "seed-admin-1",
  service1: "seed-service-1",
  service2: "seed-service-2",
  service3: "seed-service-3",
  booking1: "seed-booking-1",
  booking2: "seed-booking-2",
  payment1: "seed-payment-1",
  review1: "seed-review-1",
  providerProfile1: "seed-provider-profile-1",
  providerProfile2: "seed-provider-profile-2",
  notification1: "seed-notification-1",
  notification2: "seed-notification-2",
} as const

async function upsertUsers() {
  await prisma.user.upsert({
    where: { email: "customer@urban-clean.demo" },
    update: {
      name: "Aarav Customer",
      role: "CUSTOMER",
    },
    create: {
      id: ids.customer,
      email: "customer@urban-clean.demo",
      password: "seed-password",
      name: "Aarav Customer",
      role: "CUSTOMER",
      emailVerified: true,
    },
  })

  await prisma.user.upsert({
    where: { email: "provider1@urban-clean.demo" },
    update: {
      name: "Maya Provider",
      role: "PROVIDER",
    },
    create: {
      id: ids.provider1,
      email: "provider1@urban-clean.demo",
      password: "seed-password",
      name: "Maya Provider",
      role: "PROVIDER",
      emailVerified: true,
    },
  })

  await prisma.user.upsert({
    where: { email: "provider2@urban-clean.demo" },
    update: {
      name: "Rohan Provider",
      role: "PROVIDER",
    },
    create: {
      id: ids.provider2,
      email: "provider2@urban-clean.demo",
      password: "seed-password",
      name: "Rohan Provider",
      role: "PROVIDER",
      emailVerified: true,
    },
  })

  await prisma.user.upsert({
    where: { email: "admin@urban-clean.demo" },
    update: {
      name: "Isha Admin",
      role: "ADMIN",
    },
    create: {
      id: ids.admin,
      email: "admin@urban-clean.demo",
      password: "seed-password",
      name: "Isha Admin",
      role: "ADMIN",
      emailVerified: true,
    },
  })
}

async function upsertProviderProfiles() {
  await prisma.providerProfile.upsert({
    where: { userId: ids.provider1 },
    update: {
      bio: "Specialist in deep cleaning and move-out cleaning.",
      experience: 6,
      serviceArea: "Bengaluru East",
      averageRating: 4.8,
      totalReviews: 1,
    },
    create: {
      id: ids.providerProfile1,
      userId: ids.provider1,
      bio: "Specialist in deep cleaning and move-out cleaning.",
      experience: 6,
      serviceArea: "Bengaluru East",
      averageRating: 4.8,
      totalReviews: 1,
    },
  })

  await prisma.providerProfile.upsert({
    where: { userId: ids.provider2 },
    update: {
      bio: "Reliable recurring home cleaning with eco-safe products.",
      experience: 4,
      serviceArea: "Bengaluru South",
      averageRating: 0,
      totalReviews: 0,
    },
    create: {
      id: ids.providerProfile2,
      userId: ids.provider2,
      bio: "Reliable recurring home cleaning with eco-safe products.",
      experience: 4,
      serviceArea: "Bengaluru South",
      averageRating: 0,
      totalReviews: 0,
    },
  })
}

async function upsertServices() {
  await prisma.service.upsert({
    where: { id: ids.service1 },
    update: {
      providerId: ids.provider1,
      title: "Deep Home Cleaning",
      description:
        "Complete deep cleaning for kitchen, bathrooms, and living spaces.",
      category: "Deep Cleaning",
      city: "Bengaluru",
      price: 2499,
      durationMinutes: 240,
      isActive: true,
    },
    create: {
      id: ids.service1,
      providerId: ids.provider1,
      title: "Deep Home Cleaning",
      description:
        "Complete deep cleaning for kitchen, bathrooms, and living spaces.",
      category: "Deep Cleaning",
      city: "Bengaluru",
      price: 2499,
      durationMinutes: 240,
      isActive: true,
    },
  })

  await prisma.service.upsert({
    where: { id: ids.service2 },
    update: {
      providerId: ids.provider2,
      title: "Weekly Maintenance Cleaning",
      description: "Weekly upkeep cleaning for apartments and small homes.",
      category: "Maintenance",
      city: "Bengaluru",
      price: 899,
      durationMinutes: 90,
      isActive: true,
    },
    create: {
      id: ids.service2,
      providerId: ids.provider2,
      title: "Weekly Maintenance Cleaning",
      description: "Weekly upkeep cleaning for apartments and small homes.",
      category: "Maintenance",
      city: "Bengaluru",
      price: 899,
      durationMinutes: 90,
      isActive: true,
    },
  })

  await prisma.service.upsert({
    where: { id: ids.service3 },
    update: {
      providerId: ids.provider1,
      title: "Move-in/Move-out Cleaning",
      description:
        "Intensive pre-move cleaning with appliance and cabinet detailing.",
      category: "Move Cleaning",
      city: "Bengaluru",
      price: 3299,
      durationMinutes: 300,
      isActive: true,
    },
    create: {
      id: ids.service3,
      providerId: ids.provider1,
      title: "Move-in/Move-out Cleaning",
      description:
        "Intensive pre-move cleaning with appliance and cabinet detailing.",
      category: "Move Cleaning",
      city: "Bengaluru",
      price: 3299,
      durationMinutes: 300,
      isActive: true,
    },
  })
}

async function upsertBookingsAndPayments() {
  await prisma.booking.upsert({
    where: { id: ids.booking1 },
    update: {
      serviceId: ids.service1,
      customerId: ids.customer,
      providerId: ids.provider1,
      scheduleAt: new Date("2026-04-10T09:00:00.000Z"),
      address: "Indiranagar, Bengaluru",
      notes: "Please bring vacuum cleaner.",
      status: "COMPLETED",
      paymentStatus: "SUCCESS",
      totalAmount: 2499,
    },
    create: {
      id: ids.booking1,
      serviceId: ids.service1,
      customerId: ids.customer,
      providerId: ids.provider1,
      scheduleAt: new Date("2026-04-10T09:00:00.000Z"),
      address: "Indiranagar, Bengaluru",
      notes: "Please bring vacuum cleaner.",
      status: "COMPLETED",
      paymentStatus: "SUCCESS",
      totalAmount: 2499,
    },
  })

  await prisma.booking.upsert({
    where: { id: ids.booking2 },
    update: {
      serviceId: ids.service2,
      customerId: ids.customer,
      providerId: ids.provider2,
      scheduleAt: new Date("2026-04-15T11:30:00.000Z"),
      address: "HSR Layout, Bengaluru",
      notes: "Parking available in basement.",
      status: "CONFIRMED",
      paymentStatus: "PENDING",
      totalAmount: 899,
    },
    create: {
      id: ids.booking2,
      serviceId: ids.service2,
      customerId: ids.customer,
      providerId: ids.provider2,
      scheduleAt: new Date("2026-04-15T11:30:00.000Z"),
      address: "HSR Layout, Bengaluru",
      notes: "Parking available in basement.",
      status: "CONFIRMED",
      paymentStatus: "PENDING",
      totalAmount: 899,
    },
  })

  await prisma.payment.upsert({
    where: { bookingId: ids.booking1 },
    update: {
      customerId: ids.customer,
      providerId: ids.provider1,
      amount: 2499,
      status: "SUCCESS",
      transactionRef: "seed-txn-booking-1",
      method: "mock",
    },
    create: {
      id: ids.payment1,
      bookingId: ids.booking1,
      customerId: ids.customer,
      providerId: ids.provider1,
      amount: 2499,
      status: "SUCCESS",
      transactionRef: "seed-txn-booking-1",
      method: "mock",
    },
  })
}

async function upsertReviewsAndNotifications() {
  await prisma.review.upsert({
    where: { bookingId: ids.booking1 },
    update: {
      serviceId: ids.service1,
      customerId: ids.customer,
      providerId: ids.provider1,
      rating: 5,
      comment: "Excellent service and punctual provider.",
      isHidden: false,
    },
    create: {
      id: ids.review1,
      bookingId: ids.booking1,
      serviceId: ids.service1,
      customerId: ids.customer,
      providerId: ids.provider1,
      rating: 5,
      comment: "Excellent service and punctual provider.",
      isHidden: false,
    },
  })

  await prisma.notification.upsert({
    where: { id: ids.notification1 },
    update: {
      userId: ids.customer,
      title: "Booking confirmed",
      message: "Your booking for Weekly Maintenance Cleaning is confirmed.",
      type: "BOOKING",
      isRead: false,
    },
    create: {
      id: ids.notification1,
      userId: ids.customer,
      title: "Booking confirmed",
      message: "Your booking for Weekly Maintenance Cleaning is confirmed.",
      type: "BOOKING",
      isRead: false,
    },
  })

  await prisma.notification.upsert({
    where: { id: ids.notification2 },
    update: {
      userId: ids.provider1,
      title: "New 5-star review",
      message: "You received a new 5-star review.",
      type: "REVIEW",
      isRead: false,
    },
    create: {
      id: ids.notification2,
      userId: ids.provider1,
      title: "New 5-star review",
      message: "You received a new 5-star review.",
      type: "REVIEW",
      isRead: false,
    },
  })
}

async function main() {
  await upsertUsers()
  await upsertProviderProfiles()
  await upsertServices()
  await upsertBookingsAndPayments()
  await upsertReviewsAndNotifications()

  console.log("Seed data inserted/updated successfully")
}

main()
  .catch((error) => {
    console.error("Seed failed", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
