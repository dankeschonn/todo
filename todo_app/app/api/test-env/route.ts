import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  rabbit: "present" | "missing";
  rabbit_preview: string | null;
};

export async function GET() {
  try {
    const envExists = !!process.env.RABBITMQ_URL;
    return Response.json({
      rabbit: envExists ? "present" : "missing",
      rabbit_preview: envExists
        ? String(process.env.RABBITMQ_URL).slice(0, 10)
        : null,
    });
  } catch (err) {
    console.error("Error fetching users", err);
  }
}
