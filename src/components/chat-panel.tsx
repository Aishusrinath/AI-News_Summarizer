"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import type { ChatMode, ChatResponse } from "@/lib/chat/types";

type ChatPanelProps = {
  title?: string;
  description?: string;
  articleSlug?: string;
  starterPrompts: string[];
  compact?: boolean;
  promptOnly?: boolean;
};

type ChatThreadEntry = {
  id: string;
  role: "user" | "assistant";
  text: string;
  response?: ChatResponse;
  prompt?: string;
};

function modeLabel(mode: ChatMode) {
  return mode === "news" ? "News Model" : "General Model";
}

export function ChatPanel({
  title = "Ask the Assistant",
  description = "Ask almost anything. The assistant uses current news grounding when relevant and gives a general response for broader questions.",
  articleSlug,
  starterPrompts,
  compact = false,
  promptOnly = false,
}: ChatPanelProps) {
  const [thread, setThread] = useState<ChatThreadEntry[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [pendingMode, setPendingMode] = useState<ChatMode | null>(null);
  const [isPending, startTransition] = useTransition();
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sessionStorageKey = "ai-news-chat-session-id";
    const existingSessionId = window.sessionStorage.getItem(sessionStorageKey);

    if (existingSessionId) {
      setSessionId(existingSessionId);
      return;
    }

    const newSessionId = `session-${crypto.randomUUID()}`;
    window.sessionStorage.setItem(sessionStorageKey, newSessionId);
    setSessionId(newSessionId);
  }, []);

  useEffect(() => {
    const transcript = transcriptRef.current;

    if (!transcript) {
      return;
    }

    transcript.scrollTo({
      top: transcript.scrollHeight,
      behavior: "smooth",
    });
  }, [thread, isPending]);

  async function submitMessage(
    message: string,
    options?: { modeOverride?: ChatMode; echoUser?: boolean },
  ) {
    const trimmed = message.trim();

    if (!trimmed) {
      return;
    }

    if (options?.echoUser !== false) {
      const userEntry: ChatThreadEntry = {
        id: `user-${Date.now()}`,
        role: "user",
        text: trimmed,
      };

      setThread((current) => [...current, userEntry]);
    }

    setInput("");
    setPendingMode(options?.modeOverride ?? null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmed,
            articleSlug,
            modeOverride: options?.modeOverride,
            sessionId: sessionId || undefined,
          }),
        });

        if (!response.ok) {
          const errorPayload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(errorPayload?.error || "Chat request failed.");
        }

        const data = (await response.json()) as ChatResponse;

        setThread((current) => [
          ...current,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            text: data.answer,
            response: data,
            prompt: trimmed,
          },
        ]);
      } catch (error) {
        const fallbackMessage =
          error instanceof Error ? error.message : "Chat request failed.";

        setThread((current) => [
          ...current,
          {
            id: `assistant-error-${Date.now()}`,
            role: "assistant",
            text: `The assistant is temporarily unavailable: ${fallbackMessage}`,
            response: {
              mode: "general",
              groundingStatus: "general",
              routingReason: "The chat route did not complete successfully.",
              answer: `The assistant is temporarily unavailable: ${fallbackMessage}`,
              sources: [],
            },
            prompt: trimmed,
          },
        ]);
      } finally {
        setPendingMode(null);
      }
    });
  }

  return (
    <section
      className={[
        "flex flex-col rounded-[2rem] border border-stone-200 bg-stone-950 text-stone-50 shadow-lg shadow-stone-300/40",
        compact ? "p-5" : "p-6",
      ].join(" ")}
    >
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
          Assistant
        </p>
        <h2 className={compact ? "text-xl font-semibold tracking-tight" : "text-2xl font-semibold tracking-tight"}>
          {title}
        </h2>
        <p className="text-sm leading-7 text-stone-300">{description}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {starterPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={isPending}
            onClick={() => void submitMessage(prompt)}
            className={[
              "border border-stone-700 bg-stone-900/80 text-left text-sm text-stone-200 hover:border-stone-500 hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-60",
              compact ? "rounded-2xl px-3 py-2.5" : "rounded-full px-4 py-2",
            ].join(" ")}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div
        ref={transcriptRef}
        className={[
          "flex flex-col gap-4 overflow-y-auto rounded-[1.5rem] border border-stone-800 bg-stone-900/70 p-4",
          compact ? "mt-4 max-h-72 min-h-36" : "mt-6 max-h-[540px] min-h-[320px]",
        ].join(" ")}
      >
        {thread.length === 0 ? (
          <p className="text-sm leading-7 text-stone-400">
            {promptOnly
              ? "Choose a question above to ask about this story."
              : "Ask almost anything. News questions use the current snapshot, and broader questions use the general assistant."}
          </p>
        ) : (
          thread.map((entry) => (
            <article
              key={entry.id}
              className={[
                "rounded-2xl px-4 py-3",
                entry.role === "user"
                  ? "self-end bg-amber-400 text-stone-950"
                  : "border border-stone-800 bg-stone-950 text-stone-100",
              ].join(" ")}
            >
              {entry.role === "assistant" && entry.response ? (
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-stone-400">
                  <span>{modeLabel(entry.response.mode)}</span>
                  <span>
                    {entry.response.groundingStatus === "grounded"
                      ? "Grounded in current snapshot"
                      : entry.response.groundingStatus === "insufficient"
                        ? "Insufficient snapshot support"
                        : "Broad assistant response"}
                  </span>
                </div>
              ) : null}

              <p className="whitespace-pre-line text-sm leading-7">{entry.text}</p>

              {entry.role === "assistant" && entry.response ? (
                <div className="mt-4 space-y-3">
                  <p className="text-xs leading-6 text-stone-400">
                    {entry.response.routingReason}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {entry.response.mode !== "news" ? (
                      <button
                        type="button"
                        onClick={() =>
                          entry.prompt
                            ? void submitMessage(entry.prompt, {
                                modeOverride: "news",
                                echoUser: false,
                              })
                            : undefined
                        }
                        className="rounded-full border border-stone-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-200 hover:border-stone-500"
                      >
                        Try as News Model
                      </button>
                    ) : null}
                    {entry.response.mode !== "general" ? (
                      <button
                        type="button"
                        onClick={() =>
                          entry.prompt
                            ? void submitMessage(entry.prompt, {
                                modeOverride: "general",
                                echoUser: false,
                              })
                            : undefined
                        }
                        className="rounded-full border border-stone-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-200 hover:border-stone-500"
                      >
                        Try as General Model
                      </button>
                    ) : null}
                  </div>

                  {entry.response.sources.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                        Sources
                      </p>
                      <div className="space-y-2">
                        {entry.response.sources.map((source) => (
                          <a
                            key={source.id}
                            href={`/articles/${source.slug}`}
                            className="block rounded-xl border border-stone-800 bg-stone-900/70 px-3 py-2 text-sm text-stone-200 hover:border-stone-600"
                          >
                            <span className="block font-medium text-stone-100">{source.title}</span>
                            <span className="block text-xs text-stone-400">{source.label}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))
        )}

        {isPending ? (
          <div className="rounded-2xl border border-stone-800 bg-stone-950 px-4 py-3 text-sm text-stone-300">
            {pendingMode === "news"
              ? "Analyzing the current snapshot..."
              : pendingMode === "general"
                ? "Generating general response..."
                : "Analyzing your request..."}
          </div>
        ) : null}
      </div>

      {promptOnly ? null : (
        <form
          className="mt-5 flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submitMessage(input);
          }}
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={compact ? 2 : 4}
            placeholder={
              compact
                ? "Ask a follow-up about this story..."
                : "Ask anything, from current events to broader general questions."
            }
            className="w-full rounded-[1.5rem] border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm leading-7 text-stone-100 outline-none placeholder:text-stone-500 focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={isPending || input.trim().length === 0}
            className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-stone-950 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
          >
            {isPending ? "Working..." : "Send"}
          </button>
        </form>
      )}
    </section>
  );
}
