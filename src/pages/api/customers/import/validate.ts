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
  const sheetName = "Sheet 1";
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    res.send({
      ok: false,
      errorMessages: [`${sheetName} が見つかりません。`],
    });

    return;
  }

  const rows: { [headerCell: string]: string }[] =
    xlsx.utils.sheet_to_json(sheet);

  if (rows.length < 1) {
    res.send({
      ok: false,
      errorMessages: ["行数が 0 件です。"],
    });

    return;
  }

  const actualHeaderCells = Object.keys(rows[0]);
  const expectedHeaderCells = [
    "番号",
    "顧客名",
    "LINE ID",
    "配達スタッフ",
    "固定電話",
    "携帯電話",
  ];

  const notFoundHeaderCells = expectedHeaderCells.filter((headerCell) => {
    return actualHeaderCells.indexOf(headerCell) === -1;
  });

  if (notFoundHeaderCells.length >= 1) {
    res.send({
      ok: false,
      errorMessages: notFoundHeaderCells.map((headerCell) => {
        return `${headerCell}列が見つかりません。`;
      }),
    });

    return;
  }

  const monthHeaderPattern = /^(\d{4})年(\d{1,2})月$/;
  const deliveryHeaderCells: {
    text: string;
    year: number;
    month: number;
  }[] = [];

  actualHeaderCells.forEach((text) => {
    const match = text.match(monthHeaderPattern);

    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);

      deliveryHeaderCells.push({ text, year, month });
    }
  });

  if (deliveryHeaderCells.length < 1) {
    res.send({
      ok: false,
      errorMessages: ["月別配達日列が見つかりません。"],
    });

    return;
  }

  const invalidDeliveryHeaderCells = deliveryHeaderCells.filter(
    (deliveryHeaderCell) => {
      const { month } = deliveryHeaderCell;
      return month < 1 || 12 < month;
    }
  );

  if (invalidDeliveryHeaderCells.length >= 1) {
    res.send({
      ok: false,
      errorMessages: invalidDeliveryHeaderCells.map((deliveryHeaderCell) => {
        return `${deliveryHeaderCell.text}列の年月が不正です。`;
      }),
    });

    return;
  }

  const customers = rows.map((row) => {
    const number = row["番号"];
    const name = row["顧客名"];
    const lineUserId = row["LINE ID"];
    const deliveryStaff = row["配達スタッフ"];
    const tel = row["固定電話"];
    const mobile = row["携帯電話"];
    const deliveries = deliveryHeaderCells.map(({ text, year, month }) => {
      const input = row[text];
      return { text, year, month, input };
    });

    return {
      number,
      name,
      lineUserId,
      deliveryStaff,
      tel,
      mobile,
      deliveries,
    };
  });

  const errorMessages: string[] = [];

  customers.forEach((customer, i) => {
    const rowNumber = i + 2;
    const number = parseInt(customer.number, 10);

    if (isNaN(number) || number <= 0) {
      errorMessages.push(
        `${rowNumber} 行目：番号を 1 以上の整数でご入力ください。`
      );
    }

    if (customer.name === "" || customer.name.length > 100) {
      errorMessages.push(
        `${rowNumber} 行目：顧客名を 1〜100 文字でご入力ください。`
      );
    }

    if (
      customer.lineUserId !== "" &&
      /^[0-9A-Za-z]{33}$/.test(customer.lineUserId)
    ) {
      if (customer.lineUserId === "" || customer.lineUserId.length > 100) {
        errorMessages.push(
          `${rowNumber} 行目：LINE ID を 33 文字の半角英数字でご入力ください。`
        );
      }
    }

    if (customer.deliveryStaff !== "" && customer.deliveryStaff.length > 100) {
      errorMessages.push(
        `${rowNumber} 行目：配達スタッフを 1〜100 文字でご入力ください。`
      );
    }

    if (customer.tel !== "" && customer.tel.length > 100) {
      errorMessages.push(
        `${rowNumber} 行目：固定電話を 1〜100 文字でご入力ください。`
      );
    }

    if (customer.tel !== "" && customer.tel.length > 100) {
      errorMessages.push(
        `${rowNumber} 行目：携帯電話を 1〜100 文字でご入力ください。`
      );
    }

    for (const delivery of customer.deliveries) {
      const singleDay = "[1-5１-５]休?";
      const multipleDays = `${singleDay}(・${singleDay})*[日月火水木金土]`;
      const pattern = new RegExp(
        `^\\s*${multipleDays}(\\s${multipleDays})*\\s\*$`
      );

      if (delivery.input !== "" && !pattern.test(delivery.input)) {
        errorMessages.push(
          `${rowNumber} 行目：${delivery.text}の配達日をご確認ください。`
        );
      }
    }
  });

  const duplicatedLineUserIds = customers
    .map((customer) => customer.lineUserId)
    .filter((lineUserId, i, lineUserIds) => {
      return lineUserIds.indexOf(lineUserId) !== i;
    });

  for (const lineUserId of duplicatedLineUserIds) {
    errorMessages.push(`次の LINE ID が重複しています：${lineUserId}`);
  }

  res.send({
    ok: errorMessages.length === 0,
    errorMessages,
  });
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
