import { Server } from "socket.io";
import Valkey from "iovalkey";
import { channel } from "diagnostics_channel";

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
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
    sub.subscribe("MESSAGES");
  }

  public initListeners() {
    const io = this.io;
    console.log("Init Socket Listeners");
    io.on("connection", (socket) => {
      console.log("New socket connection", socket.id);
      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New Message received", message);

        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });
    });

    sub.on("message", (channel, message) => {
      if (channel === "MESSAGES") {
        io.emit("event:message", message);
      }
    });

    io.on("event:message", (data) => {
      // Broadcast the message to all connected clients
      io.emit("event:message", data);
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
