import { routeChatMode } from "@/lib/chat/router";

describe("routeChatMode", () => {
  it("routes timely prompts to the news mode", () => {
    const result = routeChatMode("What changed in world news this hour?");

    expect(result.mode).toBe("news");
  });

  it("routes broad explanation prompts to the general mode", () => {
    const result = routeChatMode("Explain quantum computing in simple terms.");

    expect(result.mode).toBe("general");
  });

  it("routes article-specific follow-ups to the news mode", () => {
    const result = routeChatMode("Why does this story matter?", undefined, "story-slug");

    expect(result.mode).toBe("news");
  });

  it("defaults ordinary assistant prompts to the general mode", () => {
    const result = routeChatMode("Help me write a polite follow-up email.");

    expect(result.mode).toBe("general");
  });
});
