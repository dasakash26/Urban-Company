import prisma from "../lib/prisma.ts";

async function main() {
  const bookings = await prisma.booking.findMany({
    select: { id: true, status: true, paymentStatus: true, service: { select: { title: true } } },
    take: 10,
  });
  console.log(JSON.stringify(bookings, null, 2));

  // Mark at least 2 bookings as COMPLETED + payment SUCCESS so review buttons show
  const pendingBookings = bookings.filter((b: any) => b.status === "PENDING");
  if (pendingBookings.length >= 2) {
    for (const b of pendingBookings.slice(0, 2)) {
      await prisma.booking.update({
        where: { id: b.id },
        data: { status: "COMPLETED", paymentStatus: "SUCCESS" },
      });
      console.log(`Marked booking ${b.id} (${b.service.title}) as COMPLETED`);
    }
  }

  await prisma.$disconnect();
}

main();
