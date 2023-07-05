import { Delivery, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = {
    id: 1,
    number: 1,
    name: '名古屋 花子',
    lineUserId: 'U00000000000000000000000000000000',
    deliveryStaff: '関',
    tel: '05212345678',
    mobile: '09012345678',
  };

  await prisma.user.upsert({
    where: { id: user.id },
    update: user,
    create: user,
  });

  const deliveries: Omit<Delivery, 'createdAt' | 'updatedAt'>[] = [
    {
      id: 1,
      date: new Date('2023-07-03'),
      skip: false,
      userId: user.id,
    },
    {
      id: 2,
      date: new Date('2023-07-17'),
      skip: true,
      userId: user.id,
    },
    {
      id: 3,
      date: new Date('2023-07-31'),
      skip: false,
      userId: user.id,
    },
    {
      id: 4,
      date: new Date('2023-08-14'),
      skip: false,
      userId: user.id,
    },
    {
      id: 5,
      date: new Date('2023-08-28'),
      skip: false,
      userId: user.id,
    },
  ];

  for (const delivery of deliveries) {
    await prisma.delivery.upsert({
      where: { id: delivery.id },
      update: delivery,
      create: delivery,
    });
  }
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
