import { Server } from "socket.io";
import Valkey from "iovalkey";
import { channel } from "diagnostics_channel";
import prismaClient from "./prisma";
import { produceMessage } from "./kafka";

// Configure Redis pub/sub clients
const pub = new Valkey({
  host: "valkey-338d5f72-adgaur027-82f1.l.aivencloud.com",
  port: 16015,
  username: "default",
  password: "AVNS_jNxe1sE9j4s0y41WanB",
});
const sub = new Valkey({
  host: "valkey-338d5f72-adgaur027-82f1.l.aivencloud.com",
  port: 16015,
  username: "default",
  password: "AVNS_jNxe1sE9j4s0y41WanB",
});

class SocketService {
  private _io: Server;

  constructor() {
    console.log("Init Socket Service");
    // Initialize Socket.IO server with CORS settings
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
    // Subscribe to Redis MESSAGES channel
    sub.subscribe("MESSAGES");
  }

  public initListeners() {
    const io = this.io;
    console.log("Init Socket Listeners");

    // Handle new WebSocket connections
    io.on("connection", (socket) => {
      console.log("New socket connection", socket.id);
      // Listen for messages from connected clients
      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New Message received", message);
        // Publish message to Redis channel
        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });
    });

    // Handle messages from Redis subscription
    sub.on("message", async (channel, message) => {
      if (channel === "MESSAGES") {
        console.log("New Message received", message);
        // Broadcast message to all connected WebSocket clients
        io.emit("event:message", message);
        // Send message to Kafka for persistence
        await produceMessage(message);
        console.log("Message produced to kafka Broker");
      }
    });

    // Additional message event handler (possibly redundant)
    io.on("event:message", (data) => {
      console.log("New Message received", data);
      io.emit("event:message", data);
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
