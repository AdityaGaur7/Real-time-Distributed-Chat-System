import { Kafka, Producer } from "kafkajs";
import fs from "fs";
import path from "path";

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka-28eca38c-adgaur027-82f1.l.aivencloud.com:16028"],
  ssl: {
    ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
  },
  sasl: {
    mechanism: "plain",
    username: "avnadmin",
    password: "AVNS_a1TBC5BIj4IPdZxqMcM",
  },
 
});

let producer: Producer | null = null;

export async function createProducer() {
  if (producer) {
    return producer;
  }
  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
}

export async function produceMessage(message: string) {
  const producer = await createProducer();
  await producer.send({
    topic: "MESSAGES",
    messages: [{ key: `message-${Date.now()}`, value: message }],
  });
  return true;
}
