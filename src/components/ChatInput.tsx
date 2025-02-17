import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/context/ChatContext";

const ChatInput: React.FC = () => {
  const { addMessage, appendToLastMessage, constructFinalMessage, getConversationHistory } = useChat();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "" || loading) return;
  
    const currentInput = input.trim();
    addMessage("user", currentInput);
    setInput("");
    setLoading(true);
  
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: currentInput,
          history: getConversationHistory(),
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");
  
      addMessage("assistant", "");
      let buffer = '';
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        // Decode the chunk and add it to our buffer
        buffer += new TextDecoder().decode(value);
  
        // Split on newlines, keeping any remainder in the buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last partial line in the buffer
  
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = line.slice(5).trim();
              // Skip [DONE] messages
              if (jsonData === '[DONE]') continue;
              
              if (jsonData) {
                const parsedData = JSON.parse(jsonData);
                if (parsedData.content) {
                  appendToLastMessage(parsedData.content);
                }
              }
            } catch (error) {
              console.error("Error parsing JSON chunk:", error, "Raw data:", line);
            }
          }
        }
      }
  
      // Handle any remaining data in the buffer
      if (buffer.startsWith('data: ')) {
        try {
          const jsonData = buffer.slice(5).trim();
          // Skip [DONE] messages in final buffer
          if (jsonData && jsonData !== '[DONE]') {
            const parsedData = JSON.parse(jsonData);
            if (parsedData.content) {
              appendToLastMessage(parsedData.content);
            }
          }
        } catch (error) {
          console.error("Error parsing final JSON chunk:", error);
        }
      }
  
      constructFinalMessage();
    } catch (error) {
      console.error("Streaming request error:", error);
      appendToLastMessage("Sorry, there was an error processing your request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800">
      <form onSubmit={handleSend} className="max-w-4xl mx-auto">
        <div className="relative flex flex-col rounded-lg border border-gray-700 bg-gray-700">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="max-h-[200px] min-h-[24px] w-full resize-none bg-transparent px-4 py-2 text-white placeholder-gray-400 focus:outline-none"
            placeholder="Send a message..."
            disabled={loading}
            style={{ overflowY: "auto" }}
          />
          <button
            type="submit"
            className="absolute bottom-2 right-2 p-1.5 top-1 text-gray-400 hover:text-white disabled:hover:text-gray-400 disabled:opacity-60"
            disabled={loading || input.trim() === ""}
          >
            {loading ? (
              <LoadingIcon className="h-5 w-5 animate-spin" />
            ) : (
              <SendIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className="mt-2 text-center text-xs text-gray-400">
          Press <kbd className="rounded-md border border-gray-400 px-1">Enter</kbd> to send,{" "}
          <kbd className="rounded-md border border-gray-400 px-1">Shift + Enter</kbd> for new line
        </div>
      </form>
    </div>
  );
};

const SendIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const LoadingIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
);

export default ChatInput;