import type { ChatMode } from "@/lib/chat/types";

const timelySignals = [
  "today",
  "right now",
  "latest",
  "news",
  "headline",
  "headlines",
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
  "this hour",
  "what changed",
  "update",
  "updates",
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
  const timelyScore = timelySignals.filter((signal) => normalizedMessage.includes(signal)).length;
  const generalScore = generalSignals.filter((signal) =>
    normalizedMessage.includes(signal),
  ).length;

  if (timelyScore > 0 || /\b(today|latest|now|current)\b/.test(normalizedMessage)) {
    return {
      mode: "news",
      routingReason:
        "Routed to News Model because the request appears time-sensitive or current-events focused.",
    };
  }

  if (generalScore > timelyScore) {
    return {
      mode: "general",
      routingReason:
        "Routed to General Model because the request looks like a broader explanation or assistance task.",
    };
  }

  return {
    mode: "news",
    routingReason:
      "Routed to News Model by default because the request could be interpreted as current events.",
  };
}
