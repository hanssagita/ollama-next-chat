import React, { useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";

const ChatWindow: React.FC = () => {
  const { messages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="p-4 bg-gray-900 text-white h-[500px] overflow-y-auto rounded-lg flex flex-col">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`p-2 my-2 rounded-lg w-fit max-w-xs ${
            msg.role === "user" ? "bg-blue-500 self-end ml-auto" : "bg-gray-700"
          }`}
        >
          {msg.content}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;