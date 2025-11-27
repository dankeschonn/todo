import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  rabbit: "present" | "missing";
  rabbit_preview: string | null;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const envExists = !!process.env.RABBITMQ_URL;

  return res.status(200).json({
    rabbit: envExists ? "present" : "missing",
    rabbit_preview: envExists
      ? String(process.env.RABBITMQ_URL).slice(0, 10)
      : null,
  });
}
