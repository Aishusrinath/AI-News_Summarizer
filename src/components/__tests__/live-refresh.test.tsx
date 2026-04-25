import { act, render, screen } from "@testing-library/react";

import { LiveRefresh } from "@/components/live-refresh";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh,
  }),
}));

describe("LiveRefresh", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    refresh.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function flushEffects() {
    await act(async () => {
      await Promise.resolve();
    });
  }

  function buildResponse(generatedAt: string, finalArticles = 12) {
    return new Response(
      JSON.stringify({
        generatedAt,
        finalArticles,
        refreshStatus: "success",
        isStale: false,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  it("polls for status updates without refreshing when the snapshot is unchanged", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(buildResponse("2026-04-24T20:00:00.000Z")),
    );

    render(<LiveRefresh generatedAt="2026-04-24T20:00:00.000Z" />);

    await flushEffects();

    const initialCallCount = vi.mocked(fetch).mock.calls.length;

    expect(initialCallCount).toBeGreaterThan(0);
    expect(refresh).not.toHaveBeenCalled();
    expect(screen.getByText(/Last checked/i)).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    await flushEffects();

    expect(vi.mocked(fetch).mock.calls.length).toBeGreaterThan(initialCallCount);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("refreshes the route when a new snapshot is detected", async () => {
    let currentGeneratedAt = "2026-04-24T20:00:00.000Z";

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation(async () =>
          buildResponse(
            currentGeneratedAt,
            currentGeneratedAt === "2026-04-24T21:00:00.000Z" ? 14 : 12,
          ),
        ),
    );

    render(<LiveRefresh generatedAt="2026-04-24T20:00:00.000Z" />);

    await flushEffects();

    expect(vi.mocked(fetch).mock.calls.length).toBeGreaterThan(0);
    expect(refresh).not.toHaveBeenCalled();

    currentGeneratedAt = "2026-04-24T21:00:00.000Z";

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    await flushEffects();

    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
