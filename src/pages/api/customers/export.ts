import { prisma } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import xlsx from "xlsx-js-style";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const users = await prisma.user.findMany({
    orderBy: {
      number: "asc",
    },
    include: {
      deliveries: {
        orderBy: {
          date: "asc",
        },
      },
    },
  });

  const months: string[] = [];

  for (const user of users) {
    for (const delivery of user.deliveries) {
      const year = delivery.date.getUTCFullYear();
      const month = delivery.date.getUTCMonth() + 1;
      const yearMonth = [
        year.toString().padStart(4, "0"),
        month.toString().padStart(2, "0"),
      ].join("-");

      if (months.indexOf(yearMonth) === -1) {
        months.push(yearMonth);
      }
    }
  }

  const sortedMonths = months.sort().map((yearMonth) => {
    const [yearStr, monthStr] = yearMonth.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    return { year, month };
  });

  const headerCells = [
    "番号",
    "顧客名",
    "LINE ID",
    "配達スタッフ",
    "固定電話",
    "携帯電話",
    ...sortedMonths.map(({ year, month }) => `${year}年${month}月配達日`),
  ];

  const rows = users.map((user) => {
    return [
      user.number.toString(),
      user.name,
      user.lineUserId,
      user.deliveryStaff,
      user.tel,
      user.mobile,
      ...sortedMonths.map(({ year, month }) => {
        const filteredDeliveries = user.deliveries.filter((delivery) => {
          const deliveryYear = delivery.date.getUTCFullYear();
          const deliveryMonth = delivery.date.getUTCMonth() + 1;

          return year === deliveryYear && month === deliveryMonth;
        });

        const deliveryGroups = [...Array(7)].map((_, dayOfWeek) => {
          const deliveries = filteredDeliveries.filter((delivery) => {
            return delivery.date.getUTCDay() === dayOfWeek;
          });

          return { dayOfWeek, deliveries };
        });

        return deliveryGroups
          .filter(({ deliveries }) => {
            return deliveries.length >= 1;
          })
          .map(({ dayOfWeek, deliveries }) => {
            return (
              deliveries
                .map((delivery) => {
                  const dayOfMonth =
                    Math.floor((delivery.date.getUTCDate() - 1) / 7) + 1;
                  const skip = delivery.skip ? "休" : "";
                  return `${dayOfMonth}${skip}`;
                })
                .join("・") + "日月火水木金土"[dayOfWeek]
            );
          })
          .join(" ");
      }),
    ];
  });

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.aoa_to_sheet([headerCells, ...rows]);

  worksheet["!cols"] = [
    { wpx: 50 },
    { wpx: 150 },
    { wpx: 250 },
    { wpx: 100 },
    { wpx: 200 },
    { wpx: 200 },
    ...sortedMonths.map(() => ({ wpx: 150 })),
  ];

  worksheet["!rows"] = [...Array(rows.length + 1)].map(() => ({
    hpx: 20,
  }));

  for (const key of Object.keys(worksheet)) {
    if (!key.startsWith("!")) {
      worksheet[key] = {
        ...worksheet[key],
        s: {
          alignment: {
            vertical: "top",
          },
          font: {
            name: "Yu Gothic Medium",
            sz: 12,
          },
        },
      };
    }
  }

  xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet 1");
  const buffer = xlsx.write(workbook, { type: "buffer" });

  res.setHeader("Content-Disposition", 'attachment; filename="customers.xlsx"');

  res.send(buffer);
}
