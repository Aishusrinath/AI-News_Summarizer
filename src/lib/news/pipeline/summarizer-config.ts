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

export function cleanEnvValue(value: string | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

export function getRequiredEnv(env: EnvReader, name: string, context: string) {
  const value = cleanEnvValue(env.get(name));

  if (!value) {
    throw new Error(`Missing ${name}. Set it before ${context}.`);
  }

  return value;
}

function createSingleSummarizerConfigFromEnv(
  provider: string,
  env: EnvReader,
  context: string,
): SummarizerConfig {
  if (provider === "gemini") {
    return {
      provider,
      source: "NewsAPI + Gemini pipeline",
      summarizeArticle: createGeminiSummarizer({
        apiKey: getRequiredEnv(env, "GEMINI_API_KEY", context),
        model: cleanEnvValue(env.get("GEMINI_MODEL")) || "gemini-3-flash-preview",
      }),
    };
  }

  if (provider === "huggingface") {
    return {
      provider,
      source: "NewsAPI + Hugging Face pipeline",
      summarizeArticle: createHuggingFaceSummarizer({
        apiKey: getRequiredEnv(env, "HUGGINGFACE_API_KEY", context),
        model:
          cleanEnvValue(env.get("HUGGINGFACE_MODEL")) || "facebook/bart-large-cnn",
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
      baseURL: cleanEnvValue(env.get("OLLAMA_BASE_URL")),
      model: cleanEnvValue(env.get("OLLAMA_MODEL")) || "llama3.2:3b",
    }),
  };
}

export function createSummarizerConfigFromEnv(
  env: EnvReader = processEnvReader,
  context = "refreshing news",
): SummarizerConfig {
  const provider = cleanEnvValue(env.get("SUMMARIZER_PROVIDER"))?.toLowerCase() ?? "gemini";
  const primaryConfig = createSingleSummarizerConfigFromEnv(provider, env, context);
  const fallbackProvider = cleanEnvValue(
    env.get("SUMMARIZER_FALLBACK_PROVIDER"),
  )?.toLowerCase();

  if (!fallbackProvider || fallbackProvider === primaryConfig.provider) {
    return primaryConfig;
  }

  const fallbackConfig = createSingleSummarizerConfigFromEnv(
    fallbackProvider,
    env,
    context,
  );

  return {
    provider: primaryConfig.provider,
    source: `${primaryConfig.source} with ${fallbackConfig.provider} fallback`,
    async summarizeArticle(article) {
      try {
        return await primaryConfig.summarizeArticle(article);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";

        console.warn(
          `Primary summarizer ${primaryConfig.provider} failed; trying ${fallbackConfig.provider} (${message})`,
        );

        return fallbackConfig.summarizeArticle(article);
      }
    },
  };
}
