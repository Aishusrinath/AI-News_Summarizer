import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ChatPanel } from "@/components/chat-panel";

describe("ChatPanel", () => {
  const scrollTo = vi.fn();

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            mode: "news",
            groundingStatus: "grounded",
            routingReason: "Answered from the selected article context.",
            answer: "Story answer",
            sources: [],
          }),
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      ),
    );
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      value: scrollTo,
    });
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("answers only after a question is clicked and sends the selected article context", async () => {
    render(
      <ChatPanel
        articleSlug="selected-story"
        starterPrompts={["Why does this story matter?"]}
      />,
    );

    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryByText("Story answer")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Why does this story matter?",
      }),
    );

    await screen.findByText("Story answer");

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body))).toMatchObject({
      articleSlug: "selected-story",
      message: "Why does this story matter?",
    });
  });

  it("answers after the user submits a custom question with the selected article context", async () => {
    render(
      <ChatPanel
        articleSlug="selected-story"
        starterPrompts={["Why does this story matter?"]}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Ask about the latest world-news snapshot, or switch to a broader general question.",
      ),
      {
        target: {
          value: "What should I know next?",
        },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await screen.findByText("Story answer");

    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body))).toMatchObject({
      articleSlug: "selected-story",
      message: "What should I know next?",
    });
  });
});
