"use client";
import React, {
  useCallback,
  useEffect,
  useContext,
  createContext,
  useState,
} from "react";
import io, { Socket } from "socket.io-client";

// Define types for context and props
interface SocketProviderProps {
  children?: React.ReactNode;
}

interface ISocketContext {
  sendMessage: (message: string) => any;
  messages: string[];
}

// Create context for socket functionality
const SocketContext = createContext<ISocketContext | null>(null);

// Custom hook to use socket context
export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state) {
    throw new Error("Socket state undefined not found");
  }
  return state;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  // Manage socket connection and messages state
  const [socket, setSocket] = useState<Socket | undefined>();
  const [messages, setMessages] = useState<string[]>([]);

  // Function to emit message event to server
  const sendMessage: ISocketContext["sendMessage"] = useCallback(
    (msg) => {
      console.log("Sending message", msg);
      if (socket) {
        socket.emit("event:message", { message: msg });
      }
    },
    [socket]
  );

  // Handler for receiving messages from server
  const onMessageRec = useCallback((msg: string) => {
    console.log("From server message rec", msg);
    // Parse message from JSON string
    const { message } = JSON.parse(msg) as { message: string };
    // Add new message to messages array
    setMessages((prev) => [...prev, message]);
  }, []);

  // Initialize socket connection and event listeners
  useEffect(() => {
    // Create socket connection
    const _socket = io("http://localhost:8000");

    // Handle successful connection
    _socket.on("connect", () => {
      console.log("Connected to server");
    });

    // Listen for incoming messages
    _socket.on("event:message", onMessageRec);
    setSocket(_socket);

    // Cleanup on unmount
    return () => {
      _socket.off("event:message", onMessageRec);
      _socket.disconnect();
      setSocket(undefined);
    };
  }, [onMessageRec]);

  return (
    <SocketContext.Provider value={{ sendMessage, messages }}>
      {children}
    </SocketContext.Provider>
  );
};
