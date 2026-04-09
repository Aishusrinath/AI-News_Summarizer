# AI News Summarizer

## What The App Does

AI News Summarizer is a small proof-of-concept Next.js app for a class assignment. It fetches recent news from one API, stores the raw response as JSON, transforms the raw records into a cleaned internal dataset, generates short AI summaries, and displays the results in a read-only web UI.

The app is designed around an offline pipeline plus a read-only frontend:
- the pipeline fetches, processes, and summarizes data ahead of time
- the Next.js UI reads `data/processed/articles.json`
- the deployed app does not call the news API or the LLM during page requests

## Supported Tasks

- Browse recent headlines
- Filter articles by category
- Open article detail pages
- Read AI-generated or fallback summaries
- Open the original publisher article from the card or detail page

## Out Of Scope

- User accounts
- Personalized recommendations
- Multiple news providers
- Real-time updates
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

Architecture decisions:
- Offline pipeline writes JSON artifacts outside `src/`
- The canonical frontend dataset lives at `data/processed/articles.json`
- The UI is read-only over processed data
- Category filtering uses URL search params
- Article detail pages resolve by route-safe `slug`
- Fallback summaries are used if AI summarization fails

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
   - uses the LLM summarizer on the candidate records
   - falls back to extractive summaries if needed
   - writes the final dataset to `data/processed/articles.json`

The UI reads only the final processed dataset.

## Required Env Vars

- `NEWS_API_KEY`
  - required for live article fetching
- `OPENAI_API_KEY`
  - required for live AI summarization

The UI can still run from the committed processed JSON without these secrets, but the live pipeline cannot.

A starter env template is provided in [.env.example](/d:/ai-news-summarizer/.env.example).

## Exact Commands

Install dependencies:

```bash
npm install
```

Run the UI locally:

```bash
npm run dev
```

Run tests:

```bash
npm run test
```

Build the app:

```bash
npm run build
```

Run the full pipeline:

```bash
npm run pipeline
```

Run individual pipeline stages:

```bash
npm run pipeline:fetch
npm run pipeline:process
npm run pipeline:summarize
```

Run with real data in PowerShell:

```powershell
$env:NEWS_API_KEY="your_newsapi_key"
$env:OPENAI_API_KEY="your_openai_api_key"

npm run pipeline:fetch
npm run pipeline:process
npm run pipeline:summarize
```

After that, these files will be updated:
- `data/raw/latest.json`
- `data/tmp/candidate-articles.json`
- `data/processed/articles.json`

## Testing

The project uses:
- Vitest
- React Testing Library

Current tests cover:
- rejecting invalid articles
- deduplicating articles by canonical URL
- normalizing categories
- sorting by published date
- selecting top stories
- fallback summarization behavior
- processed dataset loading

## Deployment

- The frontend is intended for Vercel deployment
- Vercel hosts the Next.js UI only
- The deployed app reads precomputed processed JSON
- No runtime filesystem writes are required in production

## Where The 5 Required Skills Were Used

The project used these Codex skills during planning and refinement:

1. `grill-me`
   - stress-tested the original project scope
   - challenged assumptions about fallback behavior, deployment, categories, and demo safety

2. `write-a-prd`
   - turned the project idea into a structured PRD
   - clarified supported tasks, out of scope items, testing requirements, and architecture decisions

3. `prd-to-issues`
   - broke the PRD into child implementation issues
   - organized the work into manageable vertical slices for the repo

4. `tdd`
   - guided test-first development for the ETL pipeline
   - added tests for invalid article rejection, dedupe behavior, sorting, normalization, and top-story selection

5. `improve-codebase-architecture`
   - reviewed the first working version
   - reorganized the codebase into `contracts`, `ingest`, `etl`, `summarize`, `data`, and `storage`
   - improved separation of concerns without changing app behavior

## Notes

- The repo may initially contain a scaffold dataset until you run the live pipeline
- If article URLs still point to `example.com`, the live fetch step has not been run yet
- The app should remain honest about excerpt-based summaries when full article text is unavailable
