import type { NextApiRequest, NextApiResponse } from "next";
import ollama from "ollama";

interface ChatMessage {
  role: string;
  content: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { prompt, history } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Invalid prompt" });
    }

    console.log("Using model:", process.env.LLM_MODEL);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    const messages: ChatMessage[] = history || [];
    messages.push({ role: "user", content: prompt });

    const streamResponse = await ollama.chat({
      model: process.env.LLM_MODEL as string,
      messages: messages,
      stream: true,
    });

    if (streamResponse && typeof streamResponse[Symbol.asyncIterator] === "function") {
      for await (const chunk of streamResponse) {
        console.log("Sending chunk to client:", chunk.message.content);

        if (chunk.message?.content) {
          res.write(`data: ${JSON.stringify({ content: chunk.message.content })}\n\n`);
          res.flush?.(); // Force immediate data delivery
        }
      }
    } else {
      throw new Error("Ollama response is not an async generator");
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Ollama error:", error);
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ error: "Failed to communicate with Ollama" })}\n\n`);
      res.end();
    }
  }
}