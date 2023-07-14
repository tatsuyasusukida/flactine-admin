import { NextApiRequest, NextApiResponse, PageConfig } from "next";
import xlsx, { WorkBook } from "xlsx";

export type CustomersImportValidateResponse = {
  ok: boolean;
  errorMessages: string[];
};

export async function readWorkBook(req: NextApiRequest): Promise<WorkBook> {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  return xlsx.read(buffer);
}

export const customersSheetName = "Sheet 1";

export type DeliveryHeaderCell = {
  text: string;
  year: number;
  month: number;
};

export function getDeliveryHeaderCells(
  actualHeaderCells: string[]
): DeliveryHeaderCell[] {
  const monthHeaderPattern = /^(\d{4})年(\d{1,2})月$/;
  const deliveryHeaderCells: DeliveryHeaderCell[] = [];

  actualHeaderCells.forEach((text) => {
    const match = text.match(monthHeaderPattern);

    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);

      deliveryHeaderCells.push({ text, year, month });
    }
  });

  return deliveryHeaderCells;
}

export function workbookToCustomers(workbook: WorkBook) {
  const sheet = workbook.Sheets[customersSheetName];
  const rows: { [headerCell: string]: string }[] =
    xlsx.utils.sheet_to_json(sheet);

  const actualHeaderCells = Object.keys(rows[0]);
  const deliveryHeaderCells = getDeliveryHeaderCells(actualHeaderCells);

  return rows.map((row) => {
    const number = row["番号"].trim();
    const name = row["顧客名"].trim();
    const lineUserId = row["LINE ID"].trim();
    const deliveryStaff = row["配達スタッフ"].trim();
    const tel = row["固定電話"].trim();
    const mobile = row["携帯電話"].trim();
    const deliveries = deliveryHeaderCells.map(({ text, year, month }) => {
      const input = row[text].trim();
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
}

export function validateWorkbook(
  workbook: WorkBook
): CustomersImportValidateResponse {
  const sheet = workbook.Sheets[customersSheetName];

  if (!sheet) {
    return {
      ok: false,
      errorMessages: [`${customersSheetName} が見つかりません。`],
    };
  }

  const rows: { [headerCell: string]: string }[] =
    xlsx.utils.sheet_to_json(sheet);

  if (rows.length < 1) {
    return {
      ok: false,
      errorMessages: ["行数が 0 件です。"],
    };
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
    return {
      ok: false,
      errorMessages: notFoundHeaderCells.map((headerCell) => {
        return `${headerCell}列が見つかりません。`;
      }),
    };
  }

  const deliveryHeaderCells = getDeliveryHeaderCells(actualHeaderCells);

  if (deliveryHeaderCells.length < 1) {
    return {
      ok: false,
      errorMessages: ["月別配達日列が見つかりません。"],
    };
  }

  const invalidDeliveryHeaderCells = deliveryHeaderCells.filter(
    (deliveryHeaderCell) => {
      const { month } = deliveryHeaderCell;
      return month < 1 || 12 < month;
    }
  );

  if (invalidDeliveryHeaderCells.length >= 1) {
    return {
      ok: false,
      errorMessages: invalidDeliveryHeaderCells.map((deliveryHeaderCell) => {
        return `${deliveryHeaderCell.text}列の年月が不正です。`;
      }),
    };
  }

  const customers = workbookToCustomers(workbook);
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
      const pattern = new RegExp(`^${multipleDays}(\\s${multipleDays})*$`);

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

  return {
    ok: errorMessages.length === 0,
    errorMessages,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CustomersImportValidateResponse>
) {
  const workbook = await readWorkBook(req);
  const validationResult = validateWorkbook(workbook);

  res.send(validationResult);
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
