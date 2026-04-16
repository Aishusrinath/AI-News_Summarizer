import type { ArticleSummarizer } from "@/lib/news/summarize/article-summarizer";
import { createGeminiSummarizer } from "@/lib/news/summarize/gemini-summarizer";
import { createHuggingFaceSummarizer } from "@/lib/news/summarize/huggingface-summarizer";
import { createOllamaSummarizer } from "@/lib/news/summarize/ollama-summarizer";
import { createOpenAiSummarizer } from "@/lib/news/summarize/openai-summarizer";

export type SummarizerProvider = "gemini" | "huggingface" | "ollama" | "openai";

export type SummarizerConfig = {
  provider: SummarizerProvider;
  source: string;
  summarizeArticle: ArticleSummarizer;
};

export type EnvReader = {
  get(name: string): string | undefined;
};

export const processEnvReader: EnvReader = {
  get(name) {
    return process.env[name];
  },
};

export function getRequiredEnv(env: EnvReader, name: string, context: string) {
  const value = env.get(name)?.trim();

  if (!value) {
    throw new Error(`Missing ${name}. Set it before ${context}.`);
  }

  return value;
}

export function createSummarizerConfigFromEnv(
  env: EnvReader = processEnvReader,
  context = "refreshing news",
): SummarizerConfig {
  const provider = env.get("SUMMARIZER_PROVIDER")?.trim().toLowerCase() ?? "gemini";

  if (provider === "gemini") {
    return {
      provider,
      source: "NewsAPI + Gemini pipeline",
      summarizeArticle: createGeminiSummarizer({
        apiKey: getRequiredEnv(env, "GEMINI_API_KEY", context),
        model: env.get("GEMINI_MODEL")?.trim() || "gemini-3-flash-preview",
      }),
    };
  }

  if (provider === "huggingface") {
    return {
      provider,
      source: "NewsAPI + Hugging Face pipeline",
      summarizeArticle: createHuggingFaceSummarizer({
        apiKey: getRequiredEnv(env, "HUGGINGFACE_API_KEY", context),
        model: env.get("HUGGINGFACE_MODEL")?.trim() || "facebook/bart-large-cnn",
      }),
    };
  }

  if (provider === "openai") {
    return {
      provider,
      source: "NewsAPI + OpenAI pipeline",
      summarizeArticle: createOpenAiSummarizer(
        getRequiredEnv(env, "OPENAI_API_KEY", context),
      ),
    };
  }

  if (provider !== "ollama") {
    throw new Error(
      `Unsupported SUMMARIZER_PROVIDER: ${provider}. Use "gemini", "huggingface", "ollama", or "openai".`,
    );
  }

  return {
    provider,
    source: "NewsAPI + Ollama pipeline",
    summarizeArticle: createOllamaSummarizer({
      baseURL: env.get("OLLAMA_BASE_URL"),
      model: env.get("OLLAMA_MODEL")?.trim() || "llama3.2:3b",
    }),
  };
}
