import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const openAiCreate = vi.fn();
const geminiGenerateContent = vi.fn();

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    responses: {
      create: openAiCreate,
    },
  })),
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: geminiGenerateContent,
    },
  })),
}));

describe("answerGeneralQuestion", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "openai-test-key";
    process.env.GEMINI_API_KEY = "gemini-test-key";
    process.env.OPENAI_GENERAL_MODEL = "gpt-4.1-mini";
    process.env.GEMINI_GENERAL_MODEL = "gemini-2.5-flash";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("uses OpenAI first when it succeeds", async () => {
    openAiCreate.mockResolvedValue({
      output_text: "OpenAI answer",
    });

    const { answerGeneralQuestion } = await import("@/lib/chat/general-answer");
    const response = await answerGeneralQuestion({
      message: "Explain recursion simply.",
      routingReason: "Routed to General Model.",
    });

    expect(response.answer).toBe("OpenAI answer");
    expect(geminiGenerateContent).not.toHaveBeenCalled();
  });

  it("falls back to Gemini when OpenAI is unavailable", async () => {
    openAiCreate.mockRejectedValue(
      new Error("429 You exceeded your current quota, please check your plan and billing details."),
    );
    geminiGenerateContent.mockResolvedValue({
      text: "Gemini backup answer",
    });

    const { answerGeneralQuestion } = await import("@/lib/chat/general-answer");
    const response = await answerGeneralQuestion({
      message: "Summarize this idea.",
      routingReason: "Routed to General Model.",
    });

    expect(openAiCreate).toHaveBeenCalledTimes(1);
    expect(geminiGenerateContent).toHaveBeenCalledTimes(1);
    expect(response.answer).toBe("Gemini backup answer");
    expect(response.routingReason).toContain("Gemini answered after another general-model provider was unavailable.");
  });

  it("returns a combined error only when all configured providers fail", async () => {
    openAiCreate.mockRejectedValue(new Error("OpenAI quota exceeded."));
    geminiGenerateContent.mockRejectedValue(new Error("Gemini resource exhausted."));

    const { answerGeneralQuestion } = await import("@/lib/chat/general-answer");
    const response = await answerGeneralQuestion({
      message: "Help me draft an email.",
      routingReason: "Routed to General Model.",
    });

    expect(response.answer).toContain("The general assistant is temporarily unavailable");
    expect(response.answer).not.toContain("OpenAI quota exceeded.");
    expect(response.answer).not.toContain("Gemini resource exhausted.");
    expect(response.routingReason).toContain(
      "The configured general-model providers were unavailable.",
    );
  });
});
