import amqplib from "amqplib";
import Pusher from "pusher";
import dotenv from "dotenv";

dotenv.config();

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

async function startWorker() {
  try {
    const connection = await amqplib.connect(process.env.RABBITMQ_URL!);

    const channel = await connection.createChannel();

    await channel.assertExchange("notes-ex", "topic", { durable: false });
    let q = await channel.assertQueue("notes-q");
    await channel.bindQueue(q.queue, "notes-ex", "note.*");

    console.log("worker listening for note updates...");

    channel.consume(q.queue, async (msg) => {
      if (!msg) return;
      try {
        const data = JSON.parse(msg.content.toString());
        try {
          await pusher.trigger("notes-channel", "note-event", {
            action: "created",
            data,
          });
        } catch (err) {
          console.error(err);
        }
        channel.ack(msg);
      } catch (err) {
        console.error(err);
        channel.nack(msg, false, false);
      }
    });
  } catch (err) {
    console.error(err);
  }
}

startWorker();
