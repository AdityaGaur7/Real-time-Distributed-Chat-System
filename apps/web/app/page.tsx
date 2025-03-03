"use client";
import React from "react";
import { useSocket } from "../context/SocketProvider";
export default function Page() {
  const { sendMessage, messages } = useSocket();

  const [message, setMessage] = React.useState("");
  return (
    <div className="chat-container">
      <div className="input-container">
        <input
          type="text"
          placeholder="Enter message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={() => sendMessage(message)}>Send</button>
      </div>
      <div className="messages-container">
        <div className="message">All messages will be displayed here</div>
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
