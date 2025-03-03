import { Kafka, Producer } from "kafkajs";
import fs from "fs";
import path from "path";
import prismaClient from "./prisma";

// Configure Kafka client with SSL and SASL authentication
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

// Cache producer instance to avoid creating multiple connections
let producer: Producer | null = null;

// Create and cache a singleton producer instance
export async function createProducer() {
  if (producer) {
    return producer;
  }
  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
}

// Send message to Kafka topic with timestamp-based key
export async function produceMessage(message: string) {
  const producer = await createProducer();
  await producer.send({
    topic: "MESSAGES",
    messages: [{ key: `message-${Date.now()}`, value: message }],
  });
  return true;
}

// Initialize Kafka consumer to process messages and store in database
export async function startMessageConsumer() {
  console.log("Starting message consumer is running");
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();
  // Subscribe to MESSAGES topic and process historical messages
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });
  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ pause, message }) => {
      console.log("New Message received");
      console.log(message.value);

      if (!message.value) return;
      try {
        // Store received message in database
        await prismaClient.message.create({
          data: {
            text: message.value?.toString(),
          },
        });
      } catch (error) {
        console.log(error, "Error while saving message to database");
        // On error, pause consumption and retry after 1 minute
        pause();
        setTimeout(() => {
          consumer.resume([{ topic: "MESSAGES" }]);
        }, 60 * 1000);
      }
    },
  });
}
