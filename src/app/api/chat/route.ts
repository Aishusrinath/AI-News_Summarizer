import { NextResponse } from "next/server";

import { answerGeneralQuestion } from "@/lib/chat/general-answer";
import { enforceChatGuardrails } from "@/lib/chat/guardrails";
import { answerNewsQuestion } from "@/lib/chat/news-answer";
import { routeChatMode } from "@/lib/chat/router";
import { chatRequestSchema, chatResponseSchema } from "@/lib/chat/types";
import { loadArticles, loadPreviousSnapshot } from "@/lib/data/load-articles";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = chatRequestSchema.parse(json);
    const guardrailResult = enforceChatGuardrails(request, parsed.sessionId);

    if (!guardrailResult.ok) {
      return NextResponse.json(
        {
          error: guardrailResult.message,
        },
        { status: guardrailResult.status },
      );
    }

    const { mode, routingReason } = routeChatMode(parsed.message, parsed.modeOverride);

    const response =
      mode === "news"
        ? answerNewsQuestion({
            message: parsed.message,
            currentDataset: await loadArticles(),
            previousDataset: await loadPreviousSnapshot(),
            routingReason,
            articleSlug: parsed.articleSlug,
          })
        : await answerGeneralQuestion({
            message: parsed.message,
            routingReason,
          });

    return NextResponse.json(chatResponseSchema.parse(response));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process chat request.";
    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 },
    );
  }
}
