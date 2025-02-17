import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useChatroom } from "./ChatroomContext";

interface Message {
  role: "user" | "assistant";
  raw: string;
  thinking?: string;
  result?: string;
}

interface ChatContextType {
  messages: Message[];
  addMessage: (role: "user" | "assistant", content: string) => void;
  appendToLastMessage: (content: string) => void;
  clearMessages: () => void;
  constructFinalMessage: () => void;
  getConversationHistory: () => { role: string; content: string; }[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messagesByChatroom, setMessagesByChatroom] = useState<Record<string, Message[]>>({});
  const { activeChatroomId, updateChatroomLastMessage } = useChatroom();

  useEffect(() => {
    const savedMessages = localStorage.getItem(`CHAT_${activeChatroomId}`);
    if (savedMessages && activeChatroomId) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessagesByChatroom(prev => ({
          ...prev,
          [activeChatroomId]: parsedMessages
        }));
      } catch (error) {
        console.error('Failed to parse saved messages:', error);
      }
    }
  }, [activeChatroomId]);

  useEffect(() => {
    if (activeChatroomId) {
      const messages = messagesByChatroom[activeChatroomId] || [];
      if (messages.length > 0) {
        localStorage.setItem(`CHAT_${activeChatroomId}`, JSON.stringify(messages));
        updateChatroomLastMessage(activeChatroomId, messages[messages.length - 1]?.result || "");
      } else {
        localStorage.removeItem(`CHAT_${activeChatroomId}`);
      }
    }
  }, [messagesByChatroom, activeChatroomId]);

  const messages = activeChatroomId ? messagesByChatroom[activeChatroomId] || [] : [];

  const addMessage = (role: "user" | "assistant", content: string) => {
    if (!activeChatroomId) return;
    const newMessage = { role, raw: content };
    setMessagesByChatroom(prev => ({
      ...prev,
      [activeChatroomId]: [...(prev[activeChatroomId] || []), newMessage]
    }));
  };

  const appendToLastMessage = (content: string) => {
    if (!activeChatroomId) return;
    setMessagesByChatroom(prev => {
      const messages = prev[activeChatroomId] || [];
      if (messages.length === 0) return prev;
      
      const updatedMessages = messages.map((msg, index) =>
        index === messages.length - 1 && msg.role === "assistant"
          ? { ...msg, raw: (msg.raw || "") + content }
          : msg
      );

      return {
        ...prev,
        [activeChatroomId]: updatedMessages
      };
    });
  };

  const clearMessages = () => {
    if (!activeChatroomId) return;
    setMessagesByChatroom(prev => ({
      ...prev,
      [activeChatroomId]: []
    }));
  };

  const constructFinalMessage = () => {
    if (!activeChatroomId) return;
    setMessagesByChatroom(prev => {
      const messages = prev[activeChatroomId] || [];
      const updatedMessages = messages.map(msg => {
        if (msg.role !== "assistant") return msg;
        
        const thinkRegex = /<think>([\s\S]*?)<\/think>/;
        const hasThinkTag = thinkRegex.test(msg.raw);
        const thinkMatch = msg.raw.match(thinkRegex);
        let thinking = thinkMatch ? thinkMatch[1].trim() : undefined;
        
        if (!thinking || thinking.length === 0) {
          thinking = undefined;
        }
        
        const result = hasThinkTag ? msg.raw.replace(thinkRegex, "").trim() : msg.raw;
        return hasThinkTag ? { ...msg, thinking, result } : { ...msg, result };
      });

      return {
        ...prev,
        [activeChatroomId]: updatedMessages
      };
    });
  };

  const getConversationHistory = () => {
    if (!activeChatroomId) return [];
    const messages = messagesByChatroom[activeChatroomId] || [];
    return messages.map(msg => ({
      role: msg.role,
      content: msg.result || msg.raw
    }));
  };

  return (
    <ChatContext.Provider value={{
      messages,
      addMessage,
      appendToLastMessage,
      clearMessages,
      constructFinalMessage,
      getConversationHistory
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};