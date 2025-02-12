import React from "react";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";

const Chat = () => {
  return (
    <div className="flex flex-col h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-xl font-bold mb-4">AI Agent by {process.env.NEXT_PUBLIC_LLM_MODEL}</h1>
      <div className="flex-1 overflow-hidden">
        <ChatWindow />
      </div>
      <ChatInput />
    </div>
  );
};

export default Chat;