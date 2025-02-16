import React from 'react';
import { useChatroom } from '@/context/ChatroomContext';

const ChatroomSidebar = () => {
  const { 
    chatrooms, 
    activeChatroomId, 
    createChatroom, 
    selectChatroom, 
    deleteChatroom 
  } = useChatroom();

  return (
    <div className="w-64 bg-gray-800 h-screen p-4 flex flex-col">
      <button
        onClick={createChatroom}
        className="w-full p-2 mb-4 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        New Chat
      </button>
      
      <div className="flex-1 overflow-y-auto">
        {chatrooms.map(room => (
          <div
            key={room.id}
            className={`p-3 mb-2 rounded cursor-pointer flex justify-between items-center ${
              activeChatroomId === room.id ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
            onClick={() => selectChatroom(room.id)}
          >
            <div className="flex-1 overflow-hidden">
              <div className="font-medium truncate">{room.name}</div>
              {room.lastMessage && (
                <div className="text-sm text-gray-400 truncate">
                  {room.lastMessage}
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteChatroom(room.id);
              }}
              className="ml-2 p-1 text-gray-400 hover:text-red-500"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatroomSidebar;