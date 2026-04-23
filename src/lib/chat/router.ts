import type { ChatMode } from "@/lib/chat/types";

const timeSignals = [
  "today",
  "right now",
  "latest",
  "this hour",
  "update",
  "updates",
  "current",
  "now",
];

const newsSignals = [
  "news",
  "headline",
  "headlines",
  "current events",
  "market",
  "markets",
  "war",
  "ceasefire",
  "conflict",
  "election",
  "president",
  "government",
  "policy",
  "politics",
  "world",
  "business",
  "technology",
  "science",
  "health",
  "what changed",
];

const generalSignals = [
  "explain",
  "learn",
  "study",
  "homework",
  "brainstorm",
  "write",
  "rewrite",
  "email",
  "code",
  "programming",
  "resume",
  "cover letter",
  "productivity",
  "plan",
];

export function routeChatMode(
  message: string,
  modeOverride?: ChatMode,
  articleSlug?: string,
): { mode: ChatMode; routingReason: string } {
  if (modeOverride) {
    return {
      mode: modeOverride,
      routingReason:
        modeOverride === "news"
          ? "Routed manually to the News Model."
          : "Routed manually to the General Model.",
    };
  }

  const normalizedMessage = message.toLowerCase();
  const timeScore = timeSignals.filter((signal) => normalizedMessage.includes(signal)).length;
  const newsScore = newsSignals.filter((signal) => normalizedMessage.includes(signal)).length;
  const generalScore = generalSignals.filter((signal) =>
    normalizedMessage.includes(signal),
  ).length;

  if (articleSlug) {
    return {
      mode: "news",
      routingReason: "Routed to News Model because the question is attached to a specific article.",
    };
  }

  if (newsScore > 0 && (timeScore > 0 || newsScore >= generalScore)) {
    return {
      mode: "news",
      routingReason:
        "Routed to News Model because the request looks like a current-events or news question.",
    };
  }

  if (generalScore > 0 || (newsScore === 0 && timeScore === 0)) {
    return {
      mode: "general",
      routingReason:
        "Routed to General Model because the request looks like a broader assistant task.",
    };
  }

  return {
    mode: "general",
    routingReason:
      "Routed to General Model by default because the request was not clearly about the current news snapshot.",
  };
}
