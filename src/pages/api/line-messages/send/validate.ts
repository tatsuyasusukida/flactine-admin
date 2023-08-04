import { prisma } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

type RequestBody = {
  form: {
    userId: string;
    content: string;
  };
};

type Validation = {
  ok: boolean;
  userId: {
    ok: boolean;
    messages: string[];
  };
  content: {
    ok: boolean;
    messages: string[];
  };
};

export async function validateRequest(
  req: NextApiRequest
): Promise<Validation> {
  const validation: Validation = {
    ok: true,
    userId: {
      ok: true,
      messages: [],
    },
    content: {
      ok: true,
      messages: [],
    },
  };

  const { form }: RequestBody = req.body;
  const userIds = form.userId.split("\n").filter((line) => line !== "");

  if (userIds.length === 0) {
    validation.userId.messages.push("LINEユーザーIDをご入力ください。");
    validation.userId.ok = false;
  }

  if (validation.userId.ok) {
    const pattern = /^U[0-9a-f]{32}$/;

    userIds.forEach((userId, i) => {
      if (!pattern.test(userId)) {
        validation.userId.messages.push(`${i + 1}件目のユーザーIDが不正です。`);
      }
    });

    validation.userId.ok = validation.userId.messages.length === 0;
  }

  if (validation.userId.ok) {
    let i = 0;

    for (const userId of userIds) {
      const user = await prisma.user.findFirst({
        where: {
          lineUserId: userId,
        },
      });

      if (!user) {
        validation.userId.messages.push(
          `${i + 1}件目のユーザーIDが登録されていません。`
        );
      }

      i += 1;
    }

    validation.userId.ok = validation.userId.messages.length === 0;
  }

  if (validation.userId.ok) {
    new Set(userIds).forEach((userId) => {
      if (userIds.filter((el) => el === userId).length !== 1) {
        validation.userId.messages.push(`${userId}が重複しています。`);
      }
    });

    validation.userId.ok = validation.userId.messages.length === 0;
  }

  if (form.content === "") {
    validation.content.messages.push("メッセージ内容をご入力ください。");
    validation.content.ok = false;
  }

  validation.ok = validation.userId.ok && validation.content.ok;

  return validation;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { form }: RequestBody = req.body;

  if (!form) {
    res.status(400).end();
    return;
  }

  if (typeof form.userId !== "string") {
    res.status(400).end();
    return;
  }

  if (typeof form.content !== "string") {
    res.status(400).end();
    return;
  }

  const validation = await validateRequest(req);

  res.send({ validation });
}
