import { prisma } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const users = await prisma.user.findMany({
    orderBy: {
      number: 'asc',
    },
    include: {
      deliveries: {
        orderBy: {
          date: 'asc',
        },
      },
    },
  })

  const months: string[] = []

  for (const user of users) {
    for (const delivery of user.deliveries) {
      const year = delivery.date.getUTCFullYear();
      const month = delivery.date.getUTCMonth() + 1;
      const yearMonth = [
        year.toString().padStart(4, '0'),
        month.toString().padStart(2, '0'),
      ].join('-')

      if (months.indexOf(yearMonth) === -1) {
        months.push(yearMonth);
      }
    }
  }

  const headerCells = [
    '番号',
    '顧客名',
    'LINE ID',
    '配達スタッフ',
    '固定電話',
    '携帯電話列',
    ...months.sort().map((yearMonth) => {
      const [yearStr, monthStr] = yearMonth.split('-')
      const year = parseInt(yearStr, 10)
      const month = parseInt(monthStr, 10)

      return `${year}年${month}月`
    })
  ]

  res.send(headerCells)
}
