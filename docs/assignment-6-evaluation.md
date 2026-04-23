# Assignment 6 Evaluation Notes

## Architecture Classification

This app is a hybrid system:

- Prompt-first summarization is used during the offline pipeline when a configured summarizer creates article summaries from title, description, and cleaned text.
- Retrieval-first behavior is used by the chat panel, but it is lightweight keyword/category retrieval over the stored snapshot rather than vector RAG.
- Tool-first/deterministic code is used for fetch, validation, normalization, deduplication, artifact storage, routing, and UI filtering.

I chose this architecture because the data volume is small enough to store as JSON snapshots, but the user experience still needs deterministic pipeline stages and grounded chat answers. A full vector RAG system was the main alternative. It could improve semantic matching once the app has many articles, multiple sources, or longer publisher text, but it would add embeddings, a vector store, chunking choices, re-indexing, more cost, more operational overhead, and harder debugging. I would adopt it if the snapshot grew beyond simple keyword/category retrieval, if users asked detailed cross-article questions, or if source text became much longer than the current NewsAPI excerpts.

## Data Flow

1. Raw input: NewsAPI response in `data/raw/latest.json`.
2. Transformation: `normalizeArticles`, `dedupeArticles`, category canonicalization, slug generation, quality scoring, and top-story selection.
3. Temporary artifact: candidate stories in `data/tmp/candidate-articles.json`.
4. Summarization: configured provider tries to summarize each normalized article; fallback summaries are used on provider failure.
5. Source of truth: `data/processed/articles.json` and `data/processed/current.json`.
6. UI and chat: Next.js pages and route handlers load the processed snapshot through `src/lib/data`.

Useful debugging/evaluation metadata now includes the raw snapshot, candidate artifact, processed counts, run report, evaluation cases, evaluation results, chat routing reason, grounding status, and returned source titles.

## Evaluation Design

The repeatable evaluation lives in:

- `data/evaluation/cases.json`
- `scripts/evaluate-assignment6.ts`
- `data/evaluation/results.json`

Metrics:

- Output quality: source hit rate on representative grounded cases. This makes sense because the app's main output is a grounded news briefing, so citing the expected article/category is a practical quality check.
- End-to-end task success: expected grounding status plus expected source when applicable. This checks the full path from user question to answer and displayed sources.
- Upstream retrieval: hit@4 for cases with an expected source/category. This isolates the retrieval step before final answer text.
- Upstream transformation: processed artifact count consistency. This checks that stored counts match the actual artifact used by the app.

Current results:

- Output quality improved from `4/5` to `4/5` on the saved representative set.
- End-to-end task success improved from `4/7` to `6/7`.
- Upstream retrieval improved from `3/4` to `4/4`.
- Processed artifact count consistency passed.

## Evidence-Based Improvement

Weakness found: the chat retrieval baseline could return the latest headlines even when a specific unsupported question had no evidence in the snapshot. For example, Toronto sports and Toronto weather questions received unrelated news sources in the baseline.

Change made:

- Added category query hints such as `ai`, `cyber`, `medical`, and `research`.
- Limited latest-headline fallback to broad snapshot questions like "latest headlines" or "what changed".
- Let specific no-match questions return `groundingStatus: "insufficient"` instead of presenting unrelated sources.
- Added a narrow-query guard so requests like `latest update of Tamilnadu elections` require a specific token match instead of falling back to generic current-news coverage.

Remaining weakness: retrieval is still lexical and category-based. It is transparent and cheap, but it can miss paraphrases that a vector retrieval layer would catch, and the stricter matching can trade off a small amount of broad-query recall for better honesty on narrow unsupported questions.
