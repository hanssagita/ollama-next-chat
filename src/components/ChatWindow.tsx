import React, { useEffect, useRef, useState } from "react";
import { useChat } from "@/context/ChatContext";
import Image from "next/image";

const ChatWindow: React.FC = () => {
  const { messages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="p-4 bg-gray-900 text-white h-[500px] overflow-y-auto rounded-lg flex flex-col space-y-3">
      {messages.map((msg, index) => {
        const isUser = msg.role === "user";
        const isProcessing = !msg.result; // Show raw until result is available
        const isExpanded = expandedThinking[index] || false;

        return (
          <div
            key={index}
            className={`relative p-3 my-2 rounded-xl max-w-lg break-words shadow-md ${
              isUser
                ? "bg-blue-500 self-end ml-auto text-white"
                : "bg-gray-800 text-gray-200"
            }`}
          >
            {/* Show raw while processing */}
            {isProcessing && <p className="animate-pulse">{msg.raw}</p>}

            {/* Once result is available, replace raw with structured output */}
            {!isProcessing && (
              <div>
                {/* Expandable Thinking Section */}
                {msg.thinking && (
                  <div className="mb-2">
                    <button
                      className="flex items-center text-sm text-yellow-400 italic hover:text-yellow-300 transition"
                      onClick={() =>
                        setExpandedThinking((prev) => ({
                          ...prev,
                          [index]: !isExpanded,
                        }))
                      }
                    >
                      <Image
                        src="/icons/arrow.png"
                        alt="Toggle Thinking"
                        width={16}
                        height={16}
                        className={`mr-1 transition-transform ${
                          isExpanded ? "rotate-180" : "rotate-0"
                        }`}
                      />
                      <span>Show Thinking</span>
                    </button>
                    {isExpanded && (
                      <p className="text-sm text-yellow-300 italic mt-1 bg-gray-700 p-2 rounded-md">
                        🤔 {msg.thinking}
                      </p>
                    )}
                  </div>
                )}

                {/* Final Processed Result */}
                <p className="text-base">{msg.result}</p>
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;