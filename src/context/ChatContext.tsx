import { createContext, useContext, useState, ReactNode } from "react";

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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (role: "user" | "assistant", content: string) => {
    setMessages((prev) => [...prev, { role, raw: content }]);
  };

  const appendToLastMessage = (content: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      return prev.map((msg, index) =>
        index === prev.length - 1 && msg.role === "assistant"
          ? { ...msg, raw: (msg.raw || "") + content } // Ensure raw is not undefined
          : msg
      );
    });
  };

  const constructFinalMessage = () => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.role !== "assistant") return msg;
  
        // Regex to extract content inside <think>...</think>, including newlines
        const thinkRegex = /<think>([\s\S]*?)<\/think>/;
  
        // Check if <think> exists in raw
        const hasThinkTag = thinkRegex.test(msg.raw);
  
        // If <think> exists, extract its content
        const thinkMatch = msg.raw.match(thinkRegex);
        let thinking = thinkMatch ? thinkMatch[1].trim() : undefined;
  
        // Ensure thinking is undefined if it is empty or just whitespace
        if (!thinking || thinking.length === 0) {
          thinking = undefined;
        }
  
        // If <think> exists, remove it to get the final result
        const result = hasThinkTag ? msg.raw.replace(thinkRegex, "").trim() : msg.raw;
  
        // Return message with thinking only if <think> existed, otherwise only result
        return hasThinkTag ? { ...msg, thinking, result } : { ...msg, result };
      })
    );
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider value={{ messages, addMessage, appendToLastMessage, clearMessages, constructFinalMessage }}>
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