import React, { useState } from "react";
import { useChat } from "@/context/ChatContext";

const ChatInput: React.FC = () => {
  const { addMessage, appendToLastMessage } = useChat();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
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

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      addMessage("assistant", ""); // Initialize an empty assistant message

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        const parsedChunk = chunk.trim().split("\n").filter(line => line.startsWith("data: "));
        for (const line of parsedChunk) {
          const jsonData = line.replace("data: ", "").trim();
          if (jsonData === "[DONE]") {
            reader.cancel();
            setLoading(false);
            return;
          }

          try {
            const parsedData = JSON.parse(jsonData);
            appendToLastMessage(parsedData.content); // Append instead of replace
          } catch (error) {
            console.error("Error parsing JSON chunk:", error, jsonData);
          }
        }
      }
    } catch (error) {
      console.error("Streaming request error:", error);
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
        type="submit"
        className="ml-2 p-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 disabled:bg-gray-600"
        disabled={loading}
      >
        {loading ? "Loading..." : "Send"}
      </button>
    </form>
  );
};

export default ChatInput;