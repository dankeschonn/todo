import prisma from "@/lib/prisma";
import amqplib from "amqplib";

let channel: amqplib.Channel | null = null;

async function createConnection() {
  try {
    const connection = await amqplib.connect(process.env.RABBITMQ_URL!);
    const channel = await connection.createChannel();
    await channel.assertExchange("notes-ex", "topic", { durable: false });
    return channel;
  } catch (err) {
    console.log(err);
  }
  return channel;
}

try {
  await createConnection().then((ch) => (channel = ch));
} catch (err) {
  console.log(err);
}

export async function GET() {
  try {
    const res = await prisma.note.findMany();
    return Response.json({ notes: res });
  } catch (err) {
    console.error("Error fetching users", err);
  }
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text) return new Response("Missing text", { status: 400 });
    const res = await prisma.note.create({
      data: {
        text,
      },
    });
    if (channel) {
      channel.publish(
        "notes-ex",
        "note.created",
        Buffer.from(JSON.stringify(res))
      );
    }
    return Response.json({ notes: res });
  } catch (err) {
    console.error(err);
  }
}

export async function PATCH(request: Request) {
  const { id, text } = await request.json();
  if (!id || !text) return new Response("Missing data", { status: 400 });
  try {
    const res = await prisma.note.update({
      where: {
        id,
      },
      data: {
        text,
      },
    });
    if (channel) {
      channel.publish(
        "notes-ex",
        "note.updated",
        Buffer.from(JSON.stringify(res))
      );
    }
    return Response.json({ notes: res });
  } catch (err) {
    return Response.json(err);
  }
}

export async function DELETE(request: Request) {
  let id = await request.json();
  try {
    const res = await prisma.note.delete({
      where: id,
    });
    if (channel) {
      channel.publish(
        "notes-ex",
        "note.deleted",
        Buffer.from(JSON.stringify(res))
      );
    }
    return Response.json({ notes: res });
  } catch (err) {
    console.error(err);
  }
}
