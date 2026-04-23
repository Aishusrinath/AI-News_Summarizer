import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const enforceChatGuardrails = vi.fn();
const routeChatMode = vi.fn();
const answerNewsQuestion = vi.fn();
const answerGeneralQuestion = vi.fn();
const loadArticles = vi.fn();
const loadPreviousSnapshot = vi.fn();

vi.mock("@/lib/chat/guardrails", () => ({
  enforceChatGuardrails,
}));

vi.mock("@/lib/chat/router", () => ({
  routeChatMode,
}));

vi.mock("@/lib/chat/news-answer", () => ({
  answerNewsQuestion,
}));

vi.mock("@/lib/chat/general-answer", () => ({
  answerGeneralQuestion,
}));

vi.mock("@/lib/data/load-articles", () => ({
  loadArticles,
  loadPreviousSnapshot,
}));

describe("POST /api/chat", () => {
  beforeEach(() => {
    enforceChatGuardrails.mockReturnValue({ ok: true });
    loadArticles.mockResolvedValue({
      generatedAt: "2026-04-10T12:00:00.000Z",
      source: "Fixture",
      categories: [],
      counts: {
        fetched: 0,
        normalized: 0,
        dropped: 0,
        deduped: 0,
        summarizedWithAi: 0,
        fallbackSummaries: 0,
        finalArticles: 0,
      },
      articles: [],
    });
    loadPreviousSnapshot.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("falls back to the general assistant when news mode lacks snapshot support", async () => {
    routeChatMode.mockReturnValue({
      mode: "news",
      routingReason: "Routed to News Model because the request looks like current events.",
    });
    answerNewsQuestion.mockReturnValue({
      mode: "news",
      groundingStatus: "insufficient",
      routingReason: "News response lacked support.",
      answer: "Insufficient snapshot support.",
      sources: [],
    });
    answerGeneralQuestion.mockResolvedValue({
      mode: "general",
      groundingStatus: "general",
      routingReason: "Fallback response.",
      answer: "Here is a general answer.",
      sources: [],
    });

    const { POST } = await import("@/app/api/chat/route");
    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "latest update of Tamilnadu elections",
          sessionId: "session-1",
        }),
      }),
    );

    const json = await response.json();

    expect(answerNewsQuestion).toHaveBeenCalledTimes(1);
    expect(answerGeneralQuestion).toHaveBeenCalledTimes(1);
    expect(json.mode).toBe("general");
    expect(json.answer).toBe("Here is a general answer.");
  });
});
