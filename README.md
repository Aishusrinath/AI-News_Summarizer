# AI News Summarizer

## Project Purpose

A small end-to-end class project that fetches recent news, processes it into validated JSON artifacts, generates concise AI summaries, and displays the results in a Next.js UI. The app presents summaries as a convenience layer over third-party reporting and always links back to the original article.

## Architecture Overview

- Offline pipeline writes raw and processed JSON artifacts outside `src/`
- One canonical committed dataset lives at `data/processed/articles.json`
- The Next.js UI reads processed JSON directly in server-side data loaders
- Category filtering uses URL search params
- Article detail pages resolve by route-safe `slug`, while data identity stays on canonical `id`
- If AI summarization fails, the pipeline falls back to a shorter extractive summary instead of breaking the run

## Setup And Env Vars

- `NEWS_API_KEY`: required once a live news provider is connected
- `OPENAI_API_KEY`: required once live AI summarization is connected

The UI can still run from committed processed JSON without these secrets. Pipeline scripts should fail fast if the live integration is enabled but the required env vars are missing.

Create a local `.env.local` or set shell env vars before running the live pipeline. A starter template is provided in `.env.example`.

## Key Commands

```bash
npm run pipeline
npm run test
npm run dev
npm run build
```

Optional debugging commands:

```bash
npm run pipeline:fetch
npm run pipeline:process
npm run pipeline:summarize
```

## Running With Real Data

To replace the demo dataset with live article URLs and AI summaries:

```powershell
$env:NEWS_API_KEY="your_newsapi_key"
$env:OPENAI_API_KEY="your_openai_api_key"

cmd /c .\node_modules\.bin\tsx.cmd scripts\fetch-news.ts
cmd /c .\node_modules\.bin\tsx.cmd scripts\process-news.ts
cmd /c .\node_modules\.bin\tsx.cmd scripts\summarize-news.ts
```

This will update:

- `data/raw/latest.json`
- `data/tmp/candidate-articles.json`
- `data/processed/articles.json`

After that, the UI should render real source article URLs instead of the placeholder `example.com` links from the scaffold dataset.

## Demo Notes And Limitations

- The project ships with a sample processed dataset for UI and test development until you run the live pipeline
- Data may be up to 24 hours old for the assignment version, and the UI shows a visible `Last updated` timestamp
- Summary wording should remain honest about excerpt-based input when full article text is unavailable
