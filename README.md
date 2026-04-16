# AI News Summarizer

## What The App Does

AI News Summarizer is a small proof-of-concept Next.js app for a class assignment. It fetches recent news from one API, stores the raw response as JSON, transforms the raw records into a cleaned internal dataset, generates short AI summaries, and displays the results in a read-only web UI.

The app is designed around an offline pipeline plus a read-only frontend:
- the pipeline fetches, processes, and summarizes data ahead of time
- the Next.js UI reads the latest processed snapshot from `data/processed/current.json`, falling back to `data/processed/articles.json`
- the deployed app does not call the news API or the LLM during page requests

## Supported Tasks

- Browse recent headlines
- Filter articles by category
- Filter articles by source region
- Open article detail pages
- Read AI-generated or fallback summaries
- Inspect summary provenance and snapshot health
- Open the original publisher article from the card or detail page

## Out Of Scope

- User accounts
- Personalized recommendations
- Multiple news providers
- True real-time newsroom updates
- Vector databases
- Full in-app rendering of publisher articles
- LLM-based category classification
- Large-scale infrastructure
- Admin dashboards

## Architecture

Current structure:

```text
src/
  app/                  Next.js routes
  components/           Presentational UI components
  lib/
    data/               Read-only queries/loaders for processed data
    formatting/         UI formatting helpers
    news/
      contracts/        Raw, normalized, and processed schemas
      ingest/           News API fetch logic
      etl/              Normalize, dedupe, sort, and dataset building
      summarize/        LLM summarization and fallback behavior
    storage/            File-based artifact paths and JSON read/write helpers
scripts/                Pipeline entrypoints
data/
  raw/                  Raw API responses
  tmp/                  Candidate and run-report artifacts
  processed/            Canonical processed dataset used by the UI
```

Key decisions:
- Offline pipeline writes JSON artifacts outside `src/`
- The canonical frontend dataset lives at `data/processed/articles.json`
- The UI is read-only over processed data
- Category filtering uses URL search params
- Region filtering uses URL search params
- Article detail pages resolve by route-safe `slug`
- Fallback summaries are used if AI summarization fails
- NewsAPI `general` stories are presented as app-facing `World` stories

## How The Pipeline Works

The pipeline has 3 stages:

1. Fetch
   - pulls recent articles from one news API
   - writes raw data to `data/raw/latest.json`

2. Process
   - validates and cleans raw records
   - normalizes categories
   - deduplicates by canonical URL
   - sorts and shapes article candidates
   - writes candidate data to `data/tmp/candidate-articles.json`

3. Summarize
   - uses Gemini by default, or Hugging Face/Ollama/OpenAI if configured
   - falls back to extractive summaries if needed
   - writes the final dataset to `data/processed/articles.json`

Latest verified pipeline run:
- `source`: `NewsAPI + Gemini pipeline`
- `finalArticles`: `27`
- `summarizedWithAi`: `12`
- `fallbackSummaries`: `15`
- Gemini returned some temporary `503 UNAVAILABLE` responses, and the fallback summarizer completed the remaining articles

## Required Env Vars

- `NEWS_API_KEY`
  - required for live article fetching
- `SUMMARIZER_PROVIDER`
  - optional
  - defaults to `gemini`
  - supported values: `gemini`, `huggingface`, `ollama`, `openai`
- `GEMINI_API_KEY`
  - required if `SUMMARIZER_PROVIDER=gemini`
- `GEMINI_MODEL`
  - optional
  - defaults to `gemini-3-flash-preview`
- `HUGGINGFACE_API_KEY`
  - required if `SUMMARIZER_PROVIDER=huggingface`
- `HUGGINGFACE_MODEL`
  - optional
  - defaults to `facebook/bart-large-cnn`
- `OLLAMA_MODEL`
  - optional
  - defaults to `llama3.2:3b`
- `OLLAMA_BASE_URL`
  - optional
  - defaults to `http://127.0.0.1:11434/v1`
- `OPENAI_API_KEY`
  - only required if `SUMMARIZER_PROVIDER=openai`
- `BLOB_READ_WRITE_TOKEN`
  - optional
  - only needed if using the `/api/refresh` endpoint with Vercel Blob instead of committed JSON snapshots
  - created by connecting a Vercel Blob store to the project
- `CRON_SECRET`
  - optional
  - only needed if exposing `/api/refresh` for authenticated cron-triggered refreshes
  - set this to a long random string

The default Hobby-friendly production setup uses GitHub Actions to run the pipeline hourly, commit refreshed JSON, and trigger a Vercel redeploy. That setup needs `NEWS_API_KEY` and the selected summarizer key in GitHub Actions secrets, but it does not require Vercel Blob or Vercel Cron.

A starter env template is provided in [.env.example](/d:/ai-news-summarizer/.env.example).

## Exact Commands

```bash
npm install
```

```bash
npm run dev
npm run test
npm run test:e2e
npm run build
npm run pipeline
```

```bash
npm run pipeline:fetch
npm run pipeline:process
npm run pipeline:summarize
```

Run with real data in PowerShell using Gemini:

```powershell
$env:NEWS_API_KEY="your_newsapi_key"
$env:SUMMARIZER_PROVIDER="gemini"
$env:GEMINI_API_KEY="your_gemini_api_key"
$env:GEMINI_MODEL="gemini-3-flash-preview"

npm run pipeline:fetch
npm run pipeline:process
npm run pipeline:summarize
```

Alternative providers:

```powershell
$env:SUMMARIZER_PROVIDER="huggingface"
$env:HUGGINGFACE_API_KEY="your_huggingface_api_key"
$env:HUGGINGFACE_MODEL="facebook/bart-large-cnn"

$env:SUMMARIZER_PROVIDER="ollama"
$env:OLLAMA_MODEL="llama3.2:3b"
$env:OLLAMA_BASE_URL="http://127.0.0.1:11434/v1"
$env:SUMMARIZER_PROVIDER="openai"
$env:OPENAI_API_KEY="your_openai_api_key"
```

For Ollama, install it first, then run:
```bash
ollama pull llama3.2:3b
ollama serve
```

After that, these files will be updated:
- `data/raw/latest.json`
- `data/tmp/candidate-articles.json`
- `data/processed/articles.json`

## Testing

Current tests cover:
- rejecting invalid articles
- deduplicating articles by canonical URL
- normalizing categories
- repairing common mojibake text artifacts
- sorting by published date
- selecting top stories
- fallback summarization behavior
- processed dataset loading
- browser-based headline filtering and article detail navigation with Playwright

## Deployment

- The frontend is intended for Vercel deployment
- Vercel hosts the Next.js UI
- GitHub Actions runs the news pipeline hourly and commits refreshed processed JSON
- Vercel redeploys from those hourly GitHub commits when automatic deployments are enabled
- The live page watcher polls `/api/refresh/status` and refreshes the open page when a newly deployed snapshot is available
- Use `/api/snapshot` to inspect the deployed snapshot timestamp, article count, categories, regions, counts, and refresh status
- The `/api/refresh` endpoint can be used with Vercel Blob and Vercel Cron on paid plans
- Vercel Hobby accounts are limited to daily cron schedules, so hourly Vercel Cron expressions fail deployment; use GitHub Actions for hourly refresh on Hobby
- If `BLOB_READ_WRITE_TOKEN` is not configured, the deployed app reads committed processed JSON

## Where The 5 Required Skills Were Used

The project used these Codex skills during planning and refinement:
- `grill-me` for scope and risk review
- `write-a-prd` for the project PRD
- `prd-to-issues` for implementation issue breakdown
- `tdd` for ETL test-first development
- `improve-codebase-architecture` for the post-MVP refactor into `contracts`, `ingest`, `etl`, `summarize`, `data`, and `storage`

## Notes

- The repo may initially contain a scaffold dataset until you run the live pipeline
- If article URLs still point to `example.com`, the live fetch step has not been run yet
- The latest committed dataset uses real NewsAPI article URLs and a mixed Gemini-plus-fallback summary run
- The app should remain honest about excerpt-based summaries when full article text is unavailable
