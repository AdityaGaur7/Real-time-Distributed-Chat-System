import http from "http";
import express from "express";
import SocketService from "./services/socket";
import dotenv from "dotenv";
import { startMessageConsumer } from "./services/kafka";
dotenv.config();
async function init() {
  await startMessageConsumer();
  const socketService = new SocketService();
  const httpServer = http.createServer();
  const PORT = process.env.PORT || 8000;

  socketService.io.attach(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  socketService.initListeners();
  
}

init();
