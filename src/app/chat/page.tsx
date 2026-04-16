"use client";

import { ChatPanel } from "@/components/chat-panel";

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_28%),linear-gradient(180deg,_#f7f3ea_0%,_#f2eee6_100%)] px-6 py-10 md:px-10">
      <div className="mx-auto w-full max-w-2xl">
        <ChatPanel
          title="Ask the Assistant"
          description="Chat with the AI about news, summaries, or anything else."
          starterPrompts={[
            "What changed in world news this hour?",
            "Summarize the top technology stories.",
            "Compare business and politics headlines today.",
            "Explain quantum computing in simple terms.",
          ]}
        />
      </div>
    </main>
  );
}