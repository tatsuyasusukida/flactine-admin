import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const validation = {
    ok: false,
    userId: {
      ok: false,
      messages: ["test", "1"],
    },
    content: {
      ok: false,
      messages: ["test"],
    },
  };
  res.send({ validation });
}
