import { prisma } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import xlsx from "xlsx-js-style";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const lineMessages = await prisma.lineMessage.findMany({
    orderBy: {
      date: "desc",
    },
  });

  const headerCells = [
    "送信日時",
    "宛先",
    "LINE ID",
    "送信内容",
    "送信結果",
    "エラーメッセージ",
  ];

  const rows = lineMessages.map((lineMessage) => {
    const statusText = lineMessage.isSent
      ? "成功"
      : lineMessage.errorCount >= 1
      ? "失敗"
      : "未送信";

    const errorMessage = lineMessage.isSent ? "" : lineMessage.errorMessage;

    return [
      convertDate(lineMessage.date),
      lineMessage.lineUserName,
      lineMessage.lineUserId,
      lineMessage.content,
      statusText,
      errorMessage,
    ];
  });

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.aoa_to_sheet([headerCells, ...rows]);

  worksheet["!cols"] = [
    { wpx: 200 },
    { wpx: 150 },
    { wpx: 250 },
    { wpx: 400 },
    { wpx: 100 },
    { wpx: 300 },
  ];

  for (const key of Object.keys(worksheet)) {
    if (key.startsWith("D")) {
      worksheet[key] = {
        ...worksheet[key],
        s: {
          alignment: {
            vertical: "top",
            wrapText: true,
          },
          font: {
            name: "Yu Gothic Medium",
            sz: 12,
          },
        },
      };
    } else if (!key.startsWith("!")) {
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

  res.setHeader(
    "Content-Disposition",
    'attachment; filename="line-messages.xlsx"'
  );

  res.send(buffer);
}

function convertDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const dayMonth = date.getDate();
  const dayWeek = "日月火水木金土"[date.getDay()];
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return `${year}年${month}月${dayMonth}日 (${dayWeek}) ${hour}時${minute}分${second}秒`;
}
