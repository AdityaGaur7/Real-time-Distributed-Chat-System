"use client";
import React from "react";
import { useSocket } from "../context/SocketProvider";
export default function Page() {
  const {sendMessage} = useSocket();
  const [messages, setMessages] = React.useState("");
  return (
    <div className="chat-container">
      <div className="messages-container">
        <div className="message">All messages will be displayed here</div>
        {/* Add more message divs here later */}
      </div>
      <div className="input-container">
        <input type="text" placeholder="Enter message" value={messages} onChange={(e) => setMessages(e.target.value)} />
        <button onClick={() => sendMessage(messages)}>Send</button>
      </div>
    </div>
  );
}

