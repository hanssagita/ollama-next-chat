import React, { useState } from "react";
import { useChat } from "@/context/ChatContext";

const ChatInput: React.FC = () => {
  const { addMessage } = useChat();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim() === "") return;
    
    addMessage("user", input);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();

      if (data && data.message) {
        // const thinkStartTag = '<think>';
        const thinkEndTag = '</think>';

        // Find the positions of the start and end tags
        // const startIdx = data.message.content.indexOf(thinkStartTag) + thinkStartTag.length;
        const endIdx = data.message.content.indexOf(thinkEndTag);

        // Extract the content within the <think> tags
        // const think = data.message.content.slice(startIdx, endIdx).trim();

        // Extract the content after the </think> tag
        const value = data.message.content.slice(endIdx + thinkEndTag.length).trim();
        addMessage("assistant", value);
      }
    } catch (error) {
      console.error("Error communicating with Ollama API:", error);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSend} className="p-4 bg-gray-800 flex rounded-lg">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 p-2 bg-gray-700 text-white rounded-lg focus:outline-none"
        placeholder="Type your message..."
        disabled={loading}
      />
      <button
        onClick={handleSend}
        className="ml-2 p-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 disabled:bg-gray-600"
        disabled={loading}
      >
        {loading ? "Loading..." : "Send"}
      </button>
    </form>
  );
};

export default ChatInput;
