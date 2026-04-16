import { enforceChatGuardrails } from "@/lib/chat/guardrails";

function buildRequest(ipAddress: string) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: {
      "x-forwarded-for": ipAddress,
    },
  });
}

describe("enforceChatGuardrails", () => {
  it("allows a normal request volume", () => {
    const result = enforceChatGuardrails(buildRequest("203.0.113.10"), "session-a");

    expect(result.ok).toBe(true);
  });

  it("blocks excessive requests for the same session", () => {
    const request = buildRequest("203.0.113.11");

    for (let index = 0; index < 16; index += 1) {
      const result = enforceChatGuardrails(request, "session-b");
      expect(result.ok).toBe(true);
    }

    const blockedResult = enforceChatGuardrails(request, "session-b");

    expect(blockedResult.ok).toBe(false);
    if (!blockedResult.ok) {
      expect(blockedResult.status).toBe(429);
    }
  });
});
