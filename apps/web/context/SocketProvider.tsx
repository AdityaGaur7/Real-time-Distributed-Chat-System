"use client";
import React, { useCallback, useEffect } from "react";
import io from "socket.io-client";
interface SocketProviderProps {
  children?: React.ReactNode;
}

interface ISocketContext {
  sendMessage: (message: string) => any;
}
const SocketContext = React.createContext<ISocketContext | null>(null);

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const sendMessage: ISocketContext["sendMessage"] = useCallback((msg) => {
    console.log("Sending message", msg);
  }, []);
  useEffect(() => {
    const _socket = io("http://localhost:8000");
    _socket.on("connect", () => {
      console.log("Connected to server");
    });
    return () => {
      _socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={null}>{children}</SocketContext.Provider>
  );
};
