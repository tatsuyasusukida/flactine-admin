import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const ok = true;
  const redirect = "/messages/send/finish";

  res.send({ ok, redirect });
}
