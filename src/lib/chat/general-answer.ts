import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

import type { ChatResponse } from "@/lib/chat/types";

async function answerWithOpenAI(message: string) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: process.env.OPENAI_GENERAL_MODEL?.trim() || "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You are a concise general assistant inside a professional world-news dashboard. Keep answers short, practical, and clearly non-news unless the user explicitly asks for broad explanation or brainstorming.",
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return response.output_text.trim();
}

async function answerWithGemini(message: string) {
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const response = await client.models.generateContent({
    model: process.env.GEMINI_GENERAL_MODEL?.trim() || "gemini-2.5-flash",
    contents: [
      "You are a concise general assistant inside a professional world-news dashboard. Keep answers short, practical, and clearly non-news unless the user explicitly asks for broad explanation or brainstorming.",
      "",
      message,
    ].join("\n"),
  });

  const answer = response.text?.trim();

  if (!answer) {
    throw new Error("Gemini returned an empty general response.");
  }

  return answer;
}

export async function answerGeneralQuestion(input: {
  message: string;
  routingReason: string;
}): Promise<ChatResponse> {
  try {
    const answer = process.env.OPENAI_API_KEY
      ? await answerWithOpenAI(input.message)
      : process.env.GEMINI_API_KEY
        ? await answerWithGemini(input.message)
        : null;

    if (!answer) {
      return {
        mode: "general",
        groundingStatus: "general",
        routingReason: `${input.routingReason} No general-model API key is configured in this environment yet.`,
        answer:
          "The General Model is not configured in this environment yet. It will support broader explanation, brainstorming, and study-style questions once an OpenAI or Gemini key is available.",
        sources: [],
      };
    }

    return {
      mode: "general",
      groundingStatus: "general",
      routingReason: input.routingReason,
      answer,
      sources: [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "General assistant failed.";

    return {
      mode: "general",
      groundingStatus: "general",
      routingReason: `${input.routingReason} The configured general model was unavailable.`,
      answer: `The General Model is temporarily unavailable: ${message}`,
      sources: [],
    };
  }
}
