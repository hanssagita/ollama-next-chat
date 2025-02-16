import React from "react";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import { useChat } from "@/context/ChatContext";

const Chat = () => {
  const { clearMessages } = useChat();

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-900 text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">AI Agent by {process.env.NEXT_PUBLIC_LLM_MODEL}</h1>
        <button
          onClick={clearMessages}
          className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors"
        >
          Clear Chat
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatWindow />
      </div>
      <ChatInput />
    </div>
  );
};

export default Chat;