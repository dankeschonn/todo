"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = __importDefault(require("amqplib"));
const pusher_1 = __importDefault(require("pusher"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pusher = new pusher_1.default({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
});
async function startWorker() {
    try {
        const connection = await amqplib_1.default.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertExchange("notes-ex", "topic", { durable: false });
        let q = await channel.assertQueue("notes-q");
        await channel.bindQueue(q.queue, "notes-ex", "note.*");
        console.log("worker listening for note updates...");
        channel.consume(q.queue, async (msg) => {
            if (!msg)
                return;
            try {
                const data = JSON.parse(msg.content.toString());
                try {
                    await pusher.trigger("notes-channel", "note-event", {
                        action: "created",
                        data,
                    });
                }
                catch (err) {
                    console.error(err);
                }
                channel.ack(msg);
            }
            catch (err) {
                console.error(err);
                channel.nack(msg, false, false);
            }
        });
    }
    catch (err) {
        console.error(err);
    }
}
startWorker();
