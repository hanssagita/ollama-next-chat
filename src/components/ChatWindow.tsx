import React, { useEffect, useRef, useState } from "react";
import { useChat } from "@/context/ChatContext";
import Image from "next/image";
import ReactMarkdown from 'react-markdown';
import { Prism } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';

const ChatWindow: React.FC = () => {
  const { messages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="p-4 text-white overflow-y-auto rounded-lg flex flex-col space-y-3 h-full">
      {messages.map((msg, index) => {
        const isUser = msg.role === "user";
        const isProcessing = !msg.result;
        const isExpanded = expandedThinking[index] || false;

        return (
          <div
            key={index}
            className={`relative p-3 my-2 rounded-xl max-w-[90%] break-words shadow-md ${
              isUser
                ? "bg-blue-500 self-end ml-auto text-white"
                : "bg-gray-800 text-gray-200"
            }`}
          >
            {isProcessing && <p className="animate-pulse">{msg.raw}</p>}

            {!isProcessing && (
              <div>
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
                      <div className="text-sm text-yellow-300 italic mt-1 bg-gray-700 p-2 rounded-md">
                        🤔 {msg.thinking}
                      </div>
                    )}
                  </div>
                )}

                <div className="markdown-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <Prism
                            {...props}
                            style={dracula}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-md my-2"
                          >
                            {String(children).replace(/\n$/, '')}
                          </Prism>
                        ) : (
                          <code className="bg-gray-700 rounded px-1" {...props}>
                            {children}
                          </code>
                        );
                      },
                      p: ({children}) => <p className="mb-4 last:mb-0">{children}</p>,
                      h1: ({children}) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                      h2: ({children}) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
                      h3: ({children}) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
                      ul: ({children}) => <ul className="list-disc ml-4 mb-4">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal ml-4 mb-4">{children}</ol>,
                      li: ({children}) => <li className="mb-1">{children}</li>,
                      strong: ({children}) => <strong className="font-bold text-white">{children}</strong>,
                    }}
                  >
                    {msg.result || msg.raw}
                  </ReactMarkdown>
                </div>
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