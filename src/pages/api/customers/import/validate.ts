import { prisma } from "@/lib/db";
import { NextApiRequest, NextApiResponse, PageConfig } from "next";
import xlsx from "xlsx";

export type CustomersImportValidateResponse = {
  ok: boolean;
  errorMessages: string[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CustomersImportValidateResponse>
) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  const workbook = xlsx.read(buffer);

  console.log(workbook.Sheets["Sheet 1"]);

  res.send({
    ok: false,
    errorMessages: [
      "ここにエラーメッセージが入ります。",
      "ここにエラーメッセージが入ります。",
      "ここにエラーメッセージが入ります。",
    ],
  });
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
