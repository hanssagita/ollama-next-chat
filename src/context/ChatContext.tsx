import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const CHAT_HISTORY_KEY = "OLLAMA_NEXT_CHAT_HISTORY";

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
  // Initialize with empty array and update after mount
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Move localStorage logic to useEffect to avoid hydration mismatch
  useEffect(() => {
    const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Failed to parse saved messages:', error);
        localStorage.removeItem(CHAT_HISTORY_KEY);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } else {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    }
  }, [messages]);

  // Rest of the code remains the same
  const addMessage = (role: "user" | "assistant", content: string) => {
    const newMessage = { role, raw: content };
    setMessages(prev => [...prev, newMessage]);
  };

  const appendToLastMessage = (content: string) => {
    setMessages(prev => {
      if (prev.length === 0) return prev;
      return prev.map((msg, index) =>
        index === prev.length - 1 && msg.role === "assistant"
          ? { ...msg, raw: (msg.raw || "") + content }
          : msg
      );
    });
  };

  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
  };

  const constructFinalMessage = () => {
    setMessages(prev =>
      prev.map(msg => {
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
      })
    );
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