import { InferenceClient } from "@huggingface/inference";

import type { ArticleSummarizer } from "@/lib/news/summarize/article-summarizer";

type HuggingFaceSummarizerOptions = {
  apiKey: string;
  model: string;
};

export function createHuggingFaceSummarizer(
  options: HuggingFaceSummarizerOptions,
): ArticleSummarizer {
  const client = new InferenceClient(options.apiKey);

  return async (article) => {
    const input = [article.summaryInput.title, article.summaryInput.description, article.summaryInput.cleanedText]
      .filter(Boolean)
      .join("\n\n");

    const response = await client.summarization({
      model: options.model,
      inputs: input,
      parameters: {
        max_length: 120,
        min_length: 30,
        do_sample: false,
      },
    });

    const summary = response.summary_text?.trim();

    if (!summary) {
      throw new Error("Hugging Face returned an empty summary.");
    }

    return summary;
  };
}
