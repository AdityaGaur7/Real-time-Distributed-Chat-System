"use client";
import React, {
  useCallback,
  useEffect,
  useContext,
  createContext,
  useState,
} from "react";
import io, { Socket } from "socket.io-client";
interface SocketProviderProps {
  children?: React.ReactNode;
}

interface ISocketContext {
  sendMessage: (message: string) => any;
}
const SocketContext = createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state) {
    throw new Error("Socket state undefined not found");
  }
  return state;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | undefined>();

  const sendMessage: ISocketContext["sendMessage"] = useCallback(
    (msg) => {
      console.log("Sending message", msg);
      if (socket) {
        socket.emit("event:message", { message: msg });
      }
    },
    [socket]
  );

  const onMessageRec = useCallback((message: string) => {
    console.log("From server message rec", message);
  }, []);

  useEffect(() => {
    const _socket = io("http://localhost:8000");

    _socket.on("connect", () => {
      console.log("Connected to server");
    });

    _socket.on("event:message", onMessageRec);
    setSocket(_socket);

    return () => {
      _socket.off("event:message", onMessageRec);
      _socket.disconnect();
      setSocket(undefined);
    };
  }, [onMessageRec]);

  return (
    <SocketContext.Provider value={{ sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};
