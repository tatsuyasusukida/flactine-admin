import { prisma } from "@/lib/db";
import { NextApiRequest, NextApiResponse, PageConfig } from "next";
import {
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

  console.log(customers);

  res.send({
    ok: false,
    redirect: "/customers/import/finish",
  });
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
