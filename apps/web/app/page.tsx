"use client";
import React from "react";
import { useSocket } from "../context/SocketProvider";

export default function Page() {
  // Get socket functionality from context
  const { sendMessage, messages } = useSocket();

  // Local state for message input
  const [message, setMessage] = React.useState("");

  return (
    <div className="chat-container">
      {/* Message input and send button */}
      <div className="input-container">
        <input
          type="text"
          placeholder="Enter message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={() => sendMessage(message)}>Send</button>
      </div>

      {/* Messages display area */}
      <div className="messages-container">
        <div className="message">All messages will be displayed here</div>
        {/* Render all messages in the conversation */}
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
