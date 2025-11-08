import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const res = await prisma.note.findMany();
    return Response.json({ notes: res });
  } catch (err) {
    console.error("Error fetching users", err);
  }
}

export async function POST(request: Request) {
  const { text } = await request.json();
  if (!text) return new Response("Missing text", { status: 400 });
  try {
    const res = await prisma.note.create({
      data: {
        text,
      },
    });
    return Response.json({ notes: res });
  } catch (err) {
    console.error(err);
  }
}
