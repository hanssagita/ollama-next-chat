import React from "react";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import ChatroomSidebar from "@/components/ChatroomSidebar";
import { useChatroom } from "@/context/ChatroomContext";

const Chat = () => {
  const { activeChatroomId } = useChatroom();

  return (
    <div className="flex h-screen">
      <ChatroomSidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 p-4">
          <h1 className="text-xl font-bold text-white">
            AI Agent by {process.env.NEXT_PUBLIC_LLM_MODEL}
          </h1>
        </div>
        {activeChatroomId ? (
          <>
            <div className="flex-1 overflow-hidden">
              <ChatWindow />
            </div>
            <ChatInput />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select or create a new chat to begin
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;