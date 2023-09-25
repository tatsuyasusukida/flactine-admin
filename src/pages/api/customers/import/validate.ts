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

export const customersSheetName = "Sheet1";

export type DeliveryHeaderCell = {
  text: string;
  year: number;
  month: number;
};

/** ヘッダーセルの中から「yyyy年m月」となっている列を探します。 */
export function getDeliveryHeaderCells(
  actualHeaderCells: string[]
): DeliveryHeaderCell[] {
  const monthHeaderPattern = /^(\d{4})年(\d{1,2})月配達日$/;
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
    const number = (row["番号"] ?? "").toString().trim();
    const name = (row["顧客名"] ?? "").toString().trim();
    const lineUserId = (row["LINE ID"] ?? "").toString().trim();
    const deliveryStaff = (row["配達スタッフ"] ?? "").toString().trim();
    const tel = (row["固定電話"] ?? "").toString().trim();
    const mobile = (row["携帯電話"] ?? "").toString().trim();
    const deliveries = deliveryHeaderCells.map(({ text, year, month }) => {
      const input = (row[text] ?? "").toString().trim();
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

  // Sheet 1 があるかどうかをチェックします。
  if (!sheet) {
    return {
      ok: false,
      errorMessages: [`${customersSheetName} が見つかりません。`],
    };
  }

  const rows: { [headerCell: string]: string }[] =
    xlsx.utils.sheet_to_json(sheet);

  // シートが空ではないかをチェックします。
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

  // あるべき列が含まれているかをチェックします。
  if (notFoundHeaderCells.length >= 1) {
    return {
      ok: false,
      errorMessages: notFoundHeaderCells.map((headerCell) => {
        return `${headerCell}列が見つかりません。`;
      }),
    };
  }

  const deliveryHeaderCells = getDeliveryHeaderCells(actualHeaderCells);

  // 月別配達日列があるかをチェックします。
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

  // 月別配達日列の年月が不正ではないかをチェックします。
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

    // 番号が 1 以上の整数であるかをチェックします。
    if (isNaN(number) || number <= 0) {
      errorMessages.push(
        `${rowNumber} 行目：番号を 1 以上の整数でご入力ください。`
      );
    }

    // 顧客名が 1〜100 文字以内で入力されているかをチェックします。
    if (customer.name === "" || customer.name.length > 100) {
      errorMessages.push(
        `${rowNumber} 行目：顧客名を 1〜100 文字でご入力ください。`
      );
    }

    // LINE ID が空欄または `U[0-9a-f]{32}` に一致するかをチェックします。
    if (
      !(
        customer.lineUserId === "" ||
        /^U[0-9a-f]{32}$/.test(customer.lineUserId)
      )
    ) {
      if (customer.lineUserId === "" || customer.lineUserId.length > 100) {
        errorMessages.push(
          `${rowNumber} 行目：LINE ID を "U" + 32 文字の半角英数字（英字は a-f のみ）でご入力ください。`
        );
      }
    }

    // 配達スタッフが 1〜100 文字以内で入力されているかをチェックします。
    if (customer.deliveryStaff !== "" && customer.deliveryStaff.length > 100) {
      errorMessages.push(
        `${rowNumber} 行目：配達スタッフを 1〜100 文字でご入力ください。`
      );
    }

    // 電話番号が 1〜100 文字以内で入力されているかをチェックします。
    if (customer.tel !== "" && customer.tel.length > 100) {
      errorMessages.push(
        `${rowNumber} 行目：固定電話を 1〜100 文字でご入力ください。`
      );
    }

    // 携帯番号が 1〜100 文字以内で入力されているかをチェックします。
    if (customer.mobile !== "" && customer.mobile.length > 100) {
      errorMessages.push(
        `${rowNumber} 行目：携帯電話を 1〜100 文字でご入力ください。`
      );
    }

    for (const delivery of customer.deliveries) {
      // 配達日が空欄の場合はスキップします。
      if (delivery.input === "") {
        continue;
      }

      const singleDay = "[1-5１-５]休?";
      const multipleDays = `${singleDay}(・${singleDay})*[日月火水木金土]`;
      const pattern = new RegExp(`^${multipleDays}(\\s${multipleDays})*$`);

      // 配達日がパターンに一致するかをチェックします。
      if (!pattern.test(delivery.input)) {
        errorMessages.push(
          `${rowNumber} 行目：${delivery.text}の配達日をご確認ください。`
        );

        continue;
      }

      const pieces = delivery.input.split(/\s+/);

      // 配達日が存在する日付かをチェックします。
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

          try {
            findDate(delivery.year, delivery.month, parsedNumber, dayOfWeek);
          } catch (err) {
            errorMessages.push(
              `${rowNumber} 行目：${delivery.text}の配達日（${parsedNumber}${dayOfWeekPart}）が存在しない日付です。`
            );
          }
        }
      }
    }
  });

  const duplicatedLineUserIds = customers
    .map((customer) => customer.lineUserId)
    .filter((lineUserId, i, lineUserIds) => {
      return lineUserId && lineUserIds.indexOf(lineUserId) !== i;
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

export function findDate(
  year: number,
  month: number,
  nth: number,
  dayOfWeek: number
): Date {
  const endDate = new Date(year, month, 0);
  const days = endDate.getDate();
  let count: number = 0;

  for (let i = 1; i <= days; i += 1) {
    const currentDate = new Date(
      [
        year.toString().padStart(4, "0"),
        month.toString().padStart(2, "0"),
        i.toString().padStart(2, "0"),
      ].join("-") + "Z"
    );

    if (currentDate.getUTCDay() === dayOfWeek) {
      count += 1;

      if (count === nth) {
        return currentDate;
      }
    }
  }

  const errorMessage =
    `Invalid date: ` +
    [
      ["year", year].join("="),
      ["month", month].join("="),
      ["nth", nth].join("="),
      ["dayOfWeek", dayOfWeek].join("="),
    ].join(", ");

  throw new TypeError(errorMessage);
}
