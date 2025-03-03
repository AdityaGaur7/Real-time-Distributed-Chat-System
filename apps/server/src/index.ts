import http from "http";
import express from "express";
import SocketService from "./services/socket";
import dotenv from "dotenv";
import { startMessageConsumer } from "./services/kafka";
dotenv.config();

async function init() {
  // Start Kafka consumer to process messages
  await startMessageConsumer();

  // Initialize WebSocket service
  const socketService = new SocketService();
  const httpServer = http.createServer();
  const PORT = process.env.PORT || 8000;

  // Attach Socket.IO to HTTP server
  socketService.io.attach(httpServer);

  // Start HTTP server
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Initialize WebSocket event listeners
  socketService.initListeners();
}

init();
