

Stress-test AI news plan
No tasks in progress


yes


Here are all three so you can use whichever fits best.

1-Minute Viva Explanation

This project is an AI News Summarizer built as a small proof-of-concept. The main architectural decision was to separate the offline pipeline from the frontend. Instead of fetching news and generating summaries during page requests, the system first ingests raw news from one API, transforms it into cleaned processed JSON, generates summaries with an LLM, and stores the results as artifacts. The Next.js UI then reads only the processed JSON, which keeps the app deterministic, fast, and deployment-safe on Vercel.

After the first working version, I improved the internal architecture by separating concerns more clearly. Contracts were split by stage, ETL logic was grouped together, summarization logic was isolated, ingestion moved into its own module, and artifact storage was centralized. I also extracted read-only data queries for the homepage and article detail page so the UI no longer handled filtering or lookup logic directly. This made the codebase easier to test, easier to explain, and more maintainable without changing user-facing behavior.

Challenges And Lessons Learned

One challenge was that the first working version already functioned correctly, but the code organization still mixed too many responsibilities inside src/lib/news. That made it harder to explain the system in terms of clean boundaries. Refactoring after the first version helped make the architecture more intentional.

Another challenge was balancing simplicity with structure. Because this was a student proof-of-concept, I wanted to avoid overengineering. The lesson was that good architecture does not always mean adding more layers. It often means making responsibilities more explicit and keeping each layer small and understandable.

Applying TDD to the ETL pipeline was also useful. Tests for invalid article rejection, canonical URL deduplication, category normalization, sorting, and top-story selection helped verify real behavior instead of implementation details. This exposed an actual bug in the deduplication logic, which showed the practical value of test-first development.

A final lesson was that the offline pipeline approach was the right tradeoff for this project. It reduced runtime risk, simplified deployment, and made the app more demo-friendly.

Final Architecture Diagram

                    +----------------------+
                    |   External News API  |
                    +----------+-----------+
                               |
                               v
                  +---------------------------+
                  |  src/lib/news/ingest      |
                  |  - fetch-news.ts          |
                  |  - news-api-client.ts     |
                  +------------+--------------+
                               |
                               v
                  +---------------------------+
                  |      data/raw/latest.json |
                  +------------+--------------+
                               |
                               v
                  +---------------------------+
                  |   src/lib/news/etl        |
                  |  - normalize-articles.ts  |
                  |  - dedupe-articles.ts     |
                  |  - select-top-stories.ts  |
                  |  - build-processed-...    |
                  |  - generate-article-slug  |
                  +------------+--------------+
                               |
                               v
               +-----------------------------------+
               | data/tmp/candidate-articles.json  |
               +----------------+------------------+
                                |
                                v
                  +---------------------------+
                  | src/lib/news/summarize    |
                  | - summarize-articles.ts   |
                  | - openai-summarizer.ts    |
                  +------------+--------------+
                               |
                               v
              +--------------------------------------+
              | data/processed/articles.json         |
              | canonical processed dataset          |
              +----------------+---------------------+
                               |
                               v
                  +---------------------------+
                  | src/lib/data              |
                  | - load-articles.ts        |
                  | - get-homepage-feed.ts    |
                  | - get-article-detail.ts   |
                  +------------+--------------+
                               |
                +--------------+---------------+
                |                              |
                v                              v
      +--------------------+         +----------------------+
      | src/app/page.tsx   |         | src/app/articles/... |
      | homepage route     |         | detail route         |
      +----------+---------+         +----------+-----------+
                 |                               |
                 v                               v
      +--------------------+         +----------------------+
      | src/components     |         | src/components       |
      | article list/cards |         | article detail       |
      +--------------------+         +----------------------+

Supporting layers:
- src/lib/news/contracts   -> raw, normalized, processed schemas
- src/lib/storage          -> artifact path ownership and JSON read/write
- src/lib/formatting       -> UI display helpers
If you want, I can turn this into a polished “System Design” section for your final report.


original article link not working



Worked for 23s
The link rendering is fine. The problem is your current processed data uses placeholder URLs from example.com, so “Read original article” points to fake demo links.

Current values in articles.json are like:

https://example.com/business/global-markets-open-higher
https://example.com/technology/battery-breakthrough
So the UI is working, but the dataset is not using real source URLs yet.

What to do

replace the sample processed dataset with real API-derived article URLs
or rerun your pipeline once fetch-news is connected to a real news provider
until then, the links will stay fake because the data is fake
If you want a safer temporary UX
I can make the app:

hide the link when the URL hostname is example.com
show a “Demo dataset” label instead
disable the button for placeholder links
If you want, I can implement option 1 now.


replace the sample processed dataset with real API-derived article URLs



Worked for 42s
I can do that, but I can’t generate real article URLs yet because the repo is still missing the one thing that matters: a real news API integration and API key.

Current state:

data/raw/latest.json still has placeholder example.com URLs
fetch-news.ts is still a stub
no news API env var is configured in this shell
Smallest unblocker: tell me which API you want to use and provide the env var name you’ll use for the key.

Best options:

NewsAPI with NEWS_API_KEY
GNews with GNEWS_API_KEY
Once you choose one, I can:

wire fetch-news.ts
update scripts/fetch-news.ts
fetch real raw data
regenerate data/processed/articles.json with real source URLs
If you want the fastest path, reply with:
Use NewsAPI
or
Use GNews


9b687786a3804df588807ebcb0d42194 this is my api key



Worked for 4m 50s
I wired the code to support real NewsAPI fetching, but I could not complete the live dataset replacement from this environment.

What I changed:

news-api-client.ts
now calls NewsAPI top-headlines
uses country, category, pageSize
authenticates with X-Api-Key
fetch-news.ts
now returns real raw articles instead of throwing
fetch-news.ts
now reads NEWS_API_KEY
writes to latest.json
Why the dataset is still not replaced:

this environment failed on the live fetch/toolchain path with OS-level EPERM/network issues
I restored latest.json to a valid placeholder state so the repo wasn’t left broken
What to run on your machine now:

$env:NEWS_API_KEY="your_key_here"
cmd /c .\node_modules\.bin\tsx.cmd scripts\fetch-news.ts
cmd /c .\node_modules\.bin\tsx.cmd scripts\process-news.ts
cmd /c .\node_modules\.bin\tsx.cmd scripts\summarize-news.ts
After that, check:

latest.json
articles.json
You should see real article url values instead of example.com.

Source used:

NewsAPI official docs for /v2/top-headlines and X-Api-Key auth: Top headlines - News API
One note:

because your current summarization step still uses fallback behavior, the URLs should become real, but summaries will still be fallback summaries until you wire the live OpenAI summarizer path.
If you want, next I can help you wire the real OpenAI summarization run too.


3 files changed
+100
-14
Undo

Review
scripts/fetch-news.ts
src/lib/news/ingest/fetch-news.ts
src/lib/news/ingest/news-api-client.ts
yes



Worked for 56s
The real OpenAI summarization path is now wired.

What changed:

summarize-news.ts
now requires OPENAI_API_KEY
uses createOpenAiSummarizer
computes real summarizedWithAi and fallbackSummaries counts
updates dataset source to "NewsAPI + OpenAI pipeline"
Verification:

cmd /c .\node_modules\.bin\vitest.cmd run passes
5 files, 9 tests passing
What you can run on your machine now to replace the demo dataset end to end:

$env:NEWS_API_KEY="your_newsapi_key"
$env:OPENAI_API_KEY="your_openai_key"

cmd /c .\node_modules\.bin\tsx.cmd scripts\fetch-news.ts
cmd /c .\node_modules\.bin\tsx.cmd scripts\process-news.ts
cmd /c .\node_modules\.bin\tsx.cmd scripts\summarize-news.ts
Then inspect:

latest.json
candidate-articles.json
articles.json
Expected result:

url fields should be real NewsAPI article URLs, not example.com
summaryType should be mostly "ai" unless a call fails
counts should show real summarizedWithAi values
One caution:

I restored latest.json to the placeholder content after the earlier failed network attempt from this environment, so you still need to run the fetch step locally once from your machine for real URLs to appear.
If you want, I can next help you add a tiny .env.local.example and README snippet so these keys are easier to run consistently.


1 file changed
Undo

Review
scripts/summarize-news.ts
yes



Worked for 23s
Added the environment setup polish.

What changed:

added .env.example
updated README.md
README now includes:

a note to create .env.local or set env vars in the shell
a concrete “Running With Real Data” section
the exact commands to fetch, process, and summarize live data
a note that real pipeline runs replace the scaffold example.com links
New .env.example contains:

NEWS_API_KEY=...
OPENAI_API_KEY=...
This makes the live pipeline path much easier to explain and repeat for your assignment.

If you want, I can do one final cleanup pass next:

run git status and summarize the refactor changes
draft a commit message
help you push this updated architecture and pipeline wiring to GitHub

2 files changed
+26
-3
Undo

Review
.env.example
README.md
PS D:\ai-news-summarizer> npm run pipeline

> ai-news-summarizer@0.1.0 pipeline
> tsx scripts/pipeline.ts

Starting pipeline...
Pipeline failed.
Error: Missing NEWS_API_KEY. Set it before running the fetch step.
    at runFetchNews (D:\ai-news-summarizer\scripts\fetch-news.ts:10:11)
    at main (D:\ai-news-summarizer\scripts\pipeline.ts:8:9)
    at <anonymous> (D:\ai-news-summarizer\scripts\pipeline.ts:15:1)
    at Object.<anonymous> (D:\ai-news-summarizer\scripts\pipeline.ts:19:2)
    at Module._compile (node:internal/modules/cjs/loader:1829:14)
    at Object.transformer (D:\ai-news-summarizer\node_modules\tsx\dist\register-D46fvsV_.cjs:3:1104)
    at Module.load (node:internal/modules/cjs/loader:1552:32)
    at Module._load (node:internal/modules/cjs/loader:1354:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at loadCJSModuleWithModuleLoad (node:internal/modules/esm/translators:327:3)
PS D:\ai-news-summarizer>



That error is expected. npm run pipeline now uses the real fetch step, so it requires NEWS_API_KEY in the shell before it starts.

For PowerShell, set the env vars first in the same terminal session:

$env:NEWS_API_KEY="9b687786a3804df588807ebcb0d42194"
$env:OPENAI_API_KEY="your_openai_api_key"
npm run pipeline
If you only want to test the fetch step first:

$env:NEWS_API_KEY="9b687786a3804df588807ebcb0d42194"
npm run pipeline:fetch
If you don’t have your OpenAI key set yet, then:

pipeline:fetch should work with just NEWS_API_KEY
pipeline:process should work after fetch
pipeline:summarize will require OPENAI_API_KEY
Recommended order:

set NEWS_API_KEY
run npm run pipeline:fetch
inspect latest.json
set OPENAI_API_KEY
run npm run pipeline
If you want, I can help you test it step by step after you run pipeline:fetch.







