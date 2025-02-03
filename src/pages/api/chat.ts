import type { NextApiRequest, NextApiResponse } from "next";
import ollama from "ollama"; // Ensure this package is installed and imported correctly

// Define a type for the error response (optional)
type ErrorResponse = { error: string };

// If you know the shape of the response from ollama.chat, you can define it here.
// For now, we’ll use any.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChatResponse = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse | ErrorResponse>
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { prompt } = req.body;

    // Simple validation for prompt
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Invalid prompt" });
    }
    const response = await ollama.chat({
      model: process.env.LLM_MODEL as string,
      messages: [{ role: "user", content: prompt }],
    });

    // Return the response from Ollama
    return res.status(200).json(response);
  } catch (error) {
    console.error("Ollama error:", error);
    return res
      .status(500)
      .json({ error: "Failed to communicate with Ollama" });
  }
}
