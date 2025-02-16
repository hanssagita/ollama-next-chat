import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

const CHATROOMS_KEY = "OLLAMA_NEXT_CHATROOMS";

interface Chatroom {
  id: string;
  name: string;
  lastMessage?: string;
  updatedAt: number;
}

interface ChatroomContextType {
  chatrooms: Chatroom[];
  activeChatroomId: string | null;
  createChatroom: () => void;
  selectChatroom: (id: string) => void;
  deleteChatroom: (id: string) => void;
  updateChatroomLastMessage: (id: string, message: string) => void;
}

const ChatroomContext = createContext<ChatroomContextType | undefined>(undefined);

export const ChatroomProvider = ({ children }: { children: ReactNode }) => {
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [activeChatroomId, setActiveChatroomId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(CHATROOMS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setChatrooms(parsed);
        if (parsed.length > 0) {
          setActiveChatroomId(parsed[0].id);
        }
      } catch (error) {
        console.error('Failed to parse saved chatrooms:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (chatrooms.length > 0) {
      localStorage.setItem(CHATROOMS_KEY, JSON.stringify(chatrooms));
    } else {
      localStorage.removeItem(CHATROOMS_KEY);
    }
  }, [chatrooms]);

  const createChatroom = () => {
    const newChatroom: Chatroom = {
      id: uuidv4(),
      name: `New Chat ${chatrooms.length + 1}`,
      updatedAt: Date.now()
    };
    setChatrooms(prev => [newChatroom, ...prev]);
    setActiveChatroomId(newChatroom.id);
  };

  const selectChatroom = (id: string) => {
    setActiveChatroomId(id);
  };

  const deleteChatroom = (id: string) => {
    setChatrooms(prev => prev.filter(room => room.id !== id));
    if (activeChatroomId === id) {
      setActiveChatroomId(chatrooms[0]?.id || null);
    }
  };

  const updateChatroomLastMessage = (id: string, message: string) => {
    setChatrooms(prev => prev.map(room => 
      room.id === id 
        ? { ...room, lastMessage: message, updatedAt: Date.now() }
        : room
    ));
  };

  return (
    <ChatroomContext.Provider value={{
      chatrooms,
      activeChatroomId,
      createChatroom,
      selectChatroom,
      deleteChatroom,
      updateChatroomLastMessage
    }}>
      {children}
    </ChatroomContext.Provider>
  );
};

export const useChatroom = () => {
  const context = useContext(ChatroomContext);
  if (!context) {
    throw new Error("useChatroom must be used within a ChatroomProvider");
  }
  return context;
};