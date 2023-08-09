import { Delivery, LineMessage, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
  const user = await prisma.user.create({
    data: {
      id: 1,
      number: 1,
      name: "名古屋 花子",
      lineUserId: process.env.SEED_LINE_USER_ID!,
      deliveryStaff: "関",
      tel: "05212345678",
      mobile: "09012345678",
    },
  });

  await prisma.delivery.deleteMany();
  await prisma.delivery.createMany({
    data: [
      {
        id: 1,
        date: new Date("2023-07-03"),
        skip: false,
        userId: user.id,
      },
      {
        id: 2,
        date: new Date("2023-07-17"),
        skip: true,
        userId: user.id,
      },
      {
        id: 3,
        date: new Date("2023-07-31"),
        skip: false,
        userId: user.id,
      },
      {
        id: 4,
        date: new Date("2023-08-14"),
        skip: false,
        userId: user.id,
      },
      {
        id: 5,
        date: new Date("2023-08-28"),
        skip: false,
        userId: user.id,
      },
    ],
  });

  await prisma.lineMessage.deleteMany();
  await prisma.lineMessage.createMany({
    data: [...Array(5)].map((_, i) => ({
      id: i + 1,
      date: new Date(2023, 6 - 1, 20, 12, 34, 56),
      lineUserName: "山田　花子",
      lineUserId: "U00000000000000000000000000000000",
      content: "\nここに本文が入ります".repeat(5).slice(1),
      isSent: true,
      errorCount: 0,
      errorMessage: "",
      errorStack: "",
      retryKey: "123e4567-e89b-12d3-a456-426614174000",
    })),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
