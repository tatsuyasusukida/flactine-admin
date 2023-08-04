import { NextApiRequest, NextApiResponse } from "next";
import { RequestBody, validateRequest } from "./validate";
import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";
import { LineMessage } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { form }: RequestBody = req.body;

  if (!form || typeof form !== "object") {
    res.status(400).end();
    return;
  }

  const validation = await validateRequest(req);

  if (!validation.ok) {
    res.status(400).end();
    return;
  }

  const lineMessages: LineMessage[] = [];

  await prisma.$transaction(async (tx) => {
    const date = new Date();
    const lineUserIds = form.userId.split("\n").filter((line) => line !== "");

    for (const lineUserId of lineUserIds) {
      const user = await tx.user.findFirst({
        where: {
          lineUserId,
        },
      });

      if (!user) {
        throw new Error(`LINE User not found: ${lineUserId}`);
      }

      const lineUserName = user.name;
      const retryKey = randomUUID();
      const lineMessage = await tx.lineMessage.create({
        data: {
          date,
          lineUserId,
          lineUserName,
          content: form.content,
          isSent: false,
          errorCount: 0,
          errorMessage: "",
          errorStack: "",
          retryKey,
        },
      });

      lineMessages.push(lineMessage);
    }
  });

  if (process.env.IS_ENABLED_LINE_SEND === "1") {
    for (const lineMessage of lineMessages) {
      await prisma.$transaction(async (tx) => {
        try {
          const endpoint = "https://api.line.me/v2/bot/message/push";
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN!}`,
              "X-Line-Retry-Key": lineMessage.retryKey,
            },
            body: JSON.stringify({
              to: lineMessage.lineUserId,
              messages: [
                {
                  type: "text",
                  text: form.content,
                },
              ],
            }),
          });

          if (response.status !== 200) {
            throw new Error(await response.text());
          }

          await tx.lineMessage.update({
            where: {
              id: lineMessage.id,
            },
            data: {
              isSent: true,
            },
          });
        } catch (err) {
          const errorCount = lineMessage.errorCount + 1;
          const errorMessage = err instanceof Error ? err.message : "" + err;
          const errorStack = err instanceof Error ? err.stack : "";

          await tx.lineMessage.update({
            where: { id: lineMessage.id },
            data: { errorCount, errorMessage, errorStack },
          });
        }
      });
    }
  }

  const ok = true;
  const redirect = "/messages/send/finish";

  res.send({ ok, redirect });
}
