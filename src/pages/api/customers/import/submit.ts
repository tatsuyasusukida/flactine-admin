import { prisma } from "@/lib/db";
import { NextApiRequest, NextApiResponse, PageConfig } from "next";
import {
  findDate,
  readWorkBook,
  validateWorkbook,
  workbookToCustomers,
} from "./validate";

export type CustomersImportSubmitResponse = {
  ok: boolean;
  redirect: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CustomersImportSubmitResponse>
) {
  const workbook = await readWorkBook(req);
  const validationResult = validateWorkbook(workbook);

  if (!validationResult.ok) {
    res.status(400).end();
    return;
  }

  const customers = workbookToCustomers(workbook);

  await prisma.$transaction(
    async (tx) => {
      await tx.user.deleteMany();

      for (const customer of customers) {
        const user = await tx.user.create({
          data: {
            number: parseInt(customer.number, 10),
            name: customer.name,
            lineUserId: customer.lineUserId,
            deliveryStaff: customer.deliveryStaff,
            tel: customer.tel,
            mobile: customer.mobile,
          },
        });

        for (const delivery of customer.deliveries) {
          if (!delivery.input) {
            continue;
          }

          const pieces = delivery.input.split(/\s+/);

          for (const piece of pieces) {
            const dayOfWeekPart = piece.slice(-1);
            const dayOfWeek = "日月火水木金土".indexOf(dayOfWeekPart);

            const daysPart = piece.slice(0, piece.length - 1);
            const days = daysPart.split("・");

            for (const day of days) {
              const skip = day.slice(-1) === "休";
              const number = skip ? day.slice(0, day.length - 1) : day;
              const convertedNumber = number.replace(/[０-９]/g, (m) =>
                "０１２３４５６７８９".indexOf(m).toString()
              );

              const parsedNumber = parseInt(convertedNumber, 10);
              const date = findDate(
                delivery.year,
                delivery.month,
                parsedNumber,
                dayOfWeek
              );

              await tx.delivery.create({
                data: {
                  date,
                  skip,
                  userId: user.id,
                },
              });
            }
          }
        }
      }

      res.send({
        ok: true,
        redirect: "/customers/import/finish",
      });
    },
    {
      timeout: parseInt(process.env.TRANSACTION_TIMEOUT || "30000", 10),
    }
  );
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
