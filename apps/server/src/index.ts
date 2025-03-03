import http from "http";
import express from "express";
import SocketService from "./services/socket";
import dotenv from "dotenv";
dotenv.config();
async function init() {
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
