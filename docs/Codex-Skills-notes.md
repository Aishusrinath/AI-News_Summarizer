Put pure presentation helpers like date formatting, summary labels, and small display text decisions in a dedicated UI utility module such as src/lib/formatting or src/components/helpers, not inside pages.


Next pressure point: how will the README be structured so it communicates architecture, operation, and grading-relevant choices quickly?

Recommended answer: “Replace the default README with five short sections: project purpose, architecture overview, setup/env vars, key commands (pipeline, test, dev, build), and demo notes/limitations. Explicitly mention offline pipeline, committed processed JSON, cached fallback, and excerpt-based summary honesty.”

Why I’m pushing here: your README is still the create-next-app default, which means the repo currently hides all of the careful thinking you’ve done. For a class assignment, the README is part of the product. It frames the grader’s expectations before they run anything.

Strong pushback: if the repo reads like a generic Next.js starter, you are leaving points on the table.

Your turn: will you keep the README intentionally short and operational, or are you planning a longer report-style document?


Replace the default README with five short sections: project purpose, architecture overview, setup/env vars, key commands (pipeline, test, dev, build), and demo notes/limitations. Explicitly mention offline pipeline, committed processed JSON, cached fallback, and excerpt-based summary honesty.


Next pressure point: what’s your naming convention for files and modules so the project stays readable as it grows a little?

Recommended answer: “Use intent-revealing names by stage and responsibility, such as fetch-news.ts, normalize-articles.ts, build-processed-dataset.ts, openai-summarizer.ts, load-articles.ts, article-card.tsx, and category-filter.tsx.”

Why I’m pushing here: small repos get messy less from size than from vague names like utils.ts, helpers.ts, or data.ts. Since your architecture depends on clean seams, names should make those seams obvious without needing a tour.

Strong pushback: if you end up with files like utils.ts, pipeline.ts, and types.ts carrying half the app, your clean design will erode faster than you expect.

Your turn: will you enforce stage-specific, responsibility-specific filenames and avoid catch-all modules like utils.ts or helpers.ts for core logic?


Use intent-revealing names by stage and responsibility, such as fetch-news.ts, normalize-articles.ts, build-processed-dataset.ts, openai-summarizer.ts, load-articles.ts, article-card.tsx, and category-filter.tsx.


Next pressure point: where will tests live, and how will their layout mirror the architecture instead of fighting it?

Recommended answer: “Keep tests close to responsibility, either under src/lib/news/__tests__, src/lib/data/__tests__, and component test folders, or in a top-level tests/ tree that mirrors those modules exactly. Name tests by behavior, not file existence.”

Why I’m pushing here: if the test layout doesn’t mirror the code boundaries, your nice layered design becomes harder to protect. Since you want a small suite, the organization needs to reinforce intent: pipeline contracts, data loading contract, and a tiny amount of UI behavior.

Strong pushback: avoid a junk drawer tests/ folder full of vaguely named files like app.test.ts or utils.test.ts. That structure will stop helping almost immediately.

Your turn: will your tests live co-located with modules or in a mirrored top-level tests/ tree?


Keep tests close to responsibility, either under src/lib/news/__tests__, src/lib/data/__tests__, and component test folders, or in a top-level tests/ tree that mirrors those modules exactly. Name tests by behavior, not file existence.


Next pressure point: pick one. Co-located tests or mirrored top-level tests/?

Recommended answer: “Use co-located tests for this project. Put pipeline/data tests beside their modules and component tests beside components. It keeps the repo small, makes ownership obvious, and matches your layered architecture without extra ceremony.”

Why I’m pushing here: both are defensible, but this repo is small and co-location usually wins on clarity at this size. A mirrored top-level tree can be nice later, but right now it adds indirection you probably do not need.

Strong pushback: indecision on structure is how repos slowly become inconsistent. Choose the cheaper rule and apply it everywhere.

Your turn: are you committing to co-located tests?


Use co-located tests for this project. Put pipeline/data tests beside their modules and component tests beside components. It keeps the repo small, makes ownership obvious, and matches your layered architecture without extra ceremony.


Next pressure point: how will you handle sample fixtures for deterministic tests without letting them drift from real API shapes?

Recommended answer: “Keep a small set of realistic fixture files derived from actual API responses and processed outputs, scrubbed if needed, in a dedicated fixtures folder near the tests. Reuse them across transformation and loading tests instead of inventing overly synthetic objects everywhere.”

Why I’m pushing here: your tests are only as good as the shapes they exercise. If every test hand-builds tiny fake objects, you’ll miss the messy edges that matter most in ETL work. But if fixtures are huge or scattered, they become noise.

Strong pushback: one or two representative fixtures beat a dozen toy mocks. Especially for raw API payloads.

Your turn: where will you keep realistic raw/processed fixtures, and will you base them on actual API payload shapes rather than purely invented objects?


Keep a small set of realistic fixture files derived from actual API responses and processed outputs, scrubbed if needed, in a dedicated fixtures folder near the tests. Reuse them across transformation and loading tests instead of inventing overly synthetic objects everywhere.


Next pressure point: what is your plan for Next.js-specific docs before coding, given this repo’s agent rules?

Recommended answer: “Read the relevant local Next.js docs under node_modules/next/dist/docs/ before implementing routing, data loading, and any server/client boundary decisions, because this project’s rules explicitly warn that this Next.js version has breaking changes.”

Why I’m pushing here: your repo has a direct instruction not to assume “normal Next.js.” That means even sensible prior habits could be stale. Since your architecture leans on App Router, server components, and route patterns, this is one place where a little discipline up front can prevent pointless rewrites.

Strong pushback: ignoring that project rule would be a process failure, not just a technical one.

Your turn: will you explicitly check the local Next.js docs for app structure and server/client patterns before implementation?


Read the relevant local Next.js docs under node_modules/next/dist/docs/ before implementing routing, data loading, and any server/client boundary decisions, because this project’s rules explicitly warn that this Next.js version has breaking changes.


Your structure plan is in good shape now. The remaining choices are small enough that I’d stop grilling architecture soon and start building.

What I’d lock in from this round:

data/raw, data/processed, and optionally data/tmp outside src
thin runners in scripts/, real logic in src/lib/news
explicit schemas for raw, normalized, and final processed data
src/lib/data for server-only loading of canonical processed JSON
?category= on the homepage and /articles/[slug] for detail pages
separate internal id and route-safe slug
co-located tests with realistic fixture files nearby
formatting helpers centralized outside pages
short operational README instead of the default starter text
local Next.js docs checked before routing/data-loading implementation
The one thing I’d still keep an eye on is over-abstracting too early. You have enough architecture now. Don’t turn this into a framework for future expansion before v1 works.

Best next move:

verify the chosen news API against your required schema
define the Zod schemas and file paths
add the pipeline script surface
implement one end-to-end happy path with one fixture-backed test
only then build out the UI
If you want, I can switch from grilling to helping you turn this into a concrete folder tree, schema sketch, and npm script plan for the repo.


yes


run and test



3 previous messages
I ran what I could.

tsc --noEmit passes, so the TypeScript app code is currently clean.

Two things blocked the full run:

Tests could not run because vitest is not installed in node_modules yet.
npm install failed with ENOSPC because the machine is out of disk space.
next build compiled successfully, then failed in this sandbox with spawn EPERM, so I don’t have a trustworthy final production-build result from here.
Right now the blocker is disk space, not the scaffolded code. Once you free up space, the next commands to rerun are:

npm install
npm run test
npm run build
If you want, I can help you identify safe space to reclaim in this repo or tighten dependencies before retrying.


Write A Prd Write a PRD for an AI News Summarizer student project.

Requirements:
- small proof-of-concept
- raw data ingestion from one news API
- ETL transformation into cleaned JSON
- file-based storage for raw and processed data
- AI summarization layer using an LLM
- user-facing UI in Next.js
- deployment on Vercel
- clear supported tasks and out-of-scope section
- architecture overview
- testing requirements
- GitHub issue-friendly format



1 previous message
Problem Statement
As a student, I need a small but credible end-to-end AI application for a class assignment that demonstrates live data ingestion, ETL processing, AI summarization, a user-facing web interface, testing, and deployment. I want the project to feel complete without expanding into production-scale infrastructure or product complexity.

The current need is for a proof-of-concept AI News Summarizer that:

fetches recent news from one external API
stores raw and processed data as files
transforms noisy API payloads into a clean internal dataset
generates concise summaries using an LLM
presents the results in a simple Next.js UI
can be deployed reliably on Vercel
The project must stay small, deterministic, and demo-safe for grading.

Solution
Build a proof-of-concept AI News Summarizer with an offline batch pipeline and a read-only web UI.

The system will:

fetch recent articles from one news API
store the original response as raw JSON
normalize, validate, deduplicate, and clean the records into processed JSON
generate short factual summaries using an LLM
fall back to a simpler extractive summary when AI summarization fails
serve the processed dataset in a Next.js app with category filtering and article detail pages
deploy the UI to Vercel using committed processed JSON artifacts
The product should be honest about its limits. If full article text is unavailable, the UI should clearly frame the result as an excerpt-based AI summary or quick take rather than a full-article summary.

User Stories
As a student developer, I want to fetch live news from one API, so that the project demonstrates real external data ingestion.
As a student developer, I want to save the raw API response as JSON, so that I can prove the ingestion step works and inspect source data later.
As a student developer, I want to transform raw API data into cleaned processed JSON, so that the UI consumes a stable, validated dataset.
As a student developer, I want to normalize categories into a small internal enum, so that filtering is reliable and simple.
As a student developer, I want to deduplicate articles by canonical identity, so that repeated or syndicated stories do not clutter the app.
As a student developer, I want to drop malformed articles before they reach the UI, so that the app remains stable.
As a student developer, I want to generate AI summaries from trusted cleaned fields only, so that the project avoids unnecessary hallucination risk.
As a student developer, I want fallback summaries when the LLM fails, so that one bad record does not break the pipeline.
As a student developer, I want to reuse previous summaries for unchanged articles, so that reruns stay cheap and fast.
As a student developer, I want the pipeline to run offline as scripts, so that the deployed UI never depends on live API or LLM calls.
As a student developer, I want file-based storage for both raw and processed artifacts, so that the architecture stays simple and assignment-friendly.
As a student developer, I want one canonical processed dataset, so that the app has a single trustworthy source of truth.
As a student developer, I want schema validation around processed artifacts, so that the UI fails clearly instead of unpredictably.
As a student developer, I want the app to keep working from the last known good processed file, so that demos are resilient to upstream failures.
As a user browsing the site, I want to see recent headlines on the homepage, so that I can quickly scan what is available.
As a user browsing the site, I want to filter headlines by category, so that I can focus on the type of news I care about.
As a user browsing the site, I want category selection reflected in the URL, so that views are shareable and bookmarkable.
As a user browsing the site, I want to open an article detail page, so that I can read more context about a selected story.
As a user browsing the site, I want to see the article source and publish date, so that I can judge relevance and credibility.
As a user browsing the site, I want a clear link to the original article, so that I can read the full source from the publisher.
As a user browsing the site, I want summary labels that distinguish AI summaries from fallback summaries, so that the app is transparent.
As a user browsing the site, I want the app to indicate when data was last updated, so that I understand freshness.
As a user browsing the site, I want the app to degrade gracefully when a category has few articles, so that sparse data does not look like a bug.
As a user browsing the site, I want the app to remain usable even if images are missing, so that layout quality does not depend on external media.
As an instructor or grader, I want the project to show a complete ingestion-to-UI pipeline, so that the assignment demonstrates end-to-end understanding.
As an instructor or grader, I want the architecture to be understandable from the README and repo structure, so that evaluation is straightforward.
As an instructor or grader, I want the project to have a small deterministic test suite, so that core behavior is verified without flaky external dependencies.
As an instructor or grader, I want the deployed app to work on Vercel without runtime writes, so that the deployment is reliable.
As a future maintainer, I want pipeline code, data loading code, and UI code separated into clear modules, so that the project stays navigable.
As a future maintainer, I want realistic test fixtures derived from actual API shapes, so that data pipeline tests exercise meaningful edge cases.
As a future maintainer, I want one top-level processed dataset contract with metadata and articles, so that UI code needs minimal glue logic.
As a future maintainer, I want run metrics such as fetched, dropped, deduped, and fallback counts, so that pipeline behavior is explainable.
As a future maintainer, I want environment validation to fail fast for pipeline-only secrets, so that the UI can still run without them.
As a future maintainer, I want stable internal article IDs and route-safe slugs, so that identity and routing concerns stay decoupled.
As a future maintainer, I want concise, factual summary rules, so that output quality is consistent across runs.
Implementation Decisions
The product is a small proof-of-concept, not a production news platform.
The system uses one news API only.
The system uses file-based storage only, with separate raw and processed JSON artifacts.
The architecture is split into three layers:
pipeline/news processing
processed data loading
UI rendering
The pipeline runs offline through scripts and is not executed during page requests.
The deployed Next.js app reads processed JSON directly and does not sit behind an internal API route unless a later requirement forces one.
The canonical processed dataset is the source of truth for the UI.
New candidate artifacts are validated before replacing the canonical processed dataset.
Processed records are UI-ready and should not require ad hoc repair logic inside page components.
The processed dataset includes top-level metadata such as generation timestamp, source, categories, counts, and article list.
Article identity is based on canonical URL when available, with a normalized source URL fallback.
Articles without a usable URL are dropped from the main dataset.
Routing uses a separate route-safe slug, while canonical identity remains on an internal ID.
Slugs are generated from sanitized title text plus a short stable suffix derived from the canonical ID.
Categories are normalized into a fixed small enum for v1.
V1 supports three categories only: general, technology, and business.
Category classification is handled by a deterministic mapping table, not by the LLM.
Articles are sorted by publish timestamp descending.
Sparse categories are allowed; the UI renders whatever validated articles exist.
All stored timestamps use ISO 8601 UTC.
Dates are formatted only at render time in the UI.
AI summaries are generated only from cleaned trusted fields such as title, description, and excerpt/content when available.
The summarizer never receives arbitrary raw JSON or HTML.
The prompt must instruct the model to stay factual, neutral, concise, and source-grounded.
Summary output is expected to be short, roughly 2 to 4 sentences when enough source material exists.
If source material is too thin or the LLM fails, the system falls back to a shorter extractive summary.
The UI must label excerpt-based output honestly and must not imply full-article summarization when full text is unavailable.
Existing summaries are reused unless summary-relevant input fields materially change.
Summary change detection is based on normalized title, description, and cleaned excerpt/content.
The summarization provider is isolated behind a small adapter interface so the rest of the pipeline does not depend on provider-specific details.
The Next.js UI uses server-side data loading for processed JSON.
Interactive UI behavior should be minimal and isolated, with client components used only where necessary.
Category filtering is URL-driven via search params.
Detail pages resolve by slug and render a not-found state if the article is missing.
Source attribution and the original article link are prominent on cards and detail pages.
Images are optional metadata and must never be required for page usability.
The README should explain the architecture, commands, env vars, limitations, and demo flow in a grading-friendly way.
Testing Decisions
Good tests should verify external behavior and data contracts, not internal implementation details.
External dependencies must be fully mocked, including the news API and the LLM provider.
The test suite should remain small and deterministic.
The highest-risk seams should be tested first:
raw-to-normalized transformation
deduplication and repair behavior
fallback summarization behavior
processed dataset loading and validation
lightweight UI behavior for category filtering and article detail rendering
Tests should use realistic fixture data based on actual API response shapes and processed dataset shapes.
Pipeline logic should be tested in isolation from the UI.
Data loading behavior should be tested separately from rendering.
UI tests should focus on user-visible outcomes rather than internal component structure.
Full browser E2E testing is not required for v1 unless explicitly requested by the instructor.
The intended test stack is Vitest plus React Testing Library.
Out of Scope
User accounts
Personalized recommendations
Vector databases
Search relevance systems
Large-scale infrastructure
Background job orchestration beyond simple scripts or optional lightweight scheduling
Multiple news providers in v1
Real-time updates
Full in-app article rendering beyond available excerpt fields
LLM-based category classification
Complex analytics dashboards
Admin panels
Heavy animation or premium design polish as a functional requirement
Production-grade observability beyond lightweight run reports and logs
Further Notes
The project should prioritize reliability and clarity over feature breadth.
Vercel deployment is for the UI only; production runtime writes are intentionally avoided.
Processed JSON may be committed to the repository for the assignment version to keep deployment simple and deterministic.
The app should display a visible “Last updated” value from the latest successful pipeline run.
The demo should show homepage headlines, category switching, detail page navigation, source attribution, summary labeling, and the offline-pipeline story.
If time becomes constrained, cosmetic enhancements and automation should be cut before core pipeline integrity, schema validation, tests, and deployment.

yes


Issue Title

PRD: AI News Summarizer Student Project

Issue Body

## Problem Statement

As a student, I need a small but credible end-to-end AI application for a class assignment that demonstrates live data ingestion, ETL processing, AI summarization, a user-facing web interface, testing, and deployment. I want the project to feel complete without expanding into production-scale infrastructure or product complexity.

The current need is for a proof-of-concept AI News Summarizer that:
- fetches recent news from one external API
- stores raw and processed data as files
- transforms noisy API payloads into a clean internal dataset
- generates concise summaries using an LLM
- presents the results in a simple Next.js UI
- can be deployed reliably on Vercel

The project must stay small, deterministic, and demo-safe for grading.

## Solution

Build a proof-of-concept AI News Summarizer with an offline batch pipeline and a read-only web UI.

The system will:
- fetch recent articles from one news API
- store the original response as raw JSON
- normalize, validate, deduplicate, and clean the records into processed JSON
- generate short factual summaries using an LLM
- fall back to a simpler extractive summary when AI summarization fails
- serve the processed dataset in a Next.js app with category filtering and article detail pages
- deploy the UI to Vercel using committed processed JSON artifacts

The product should be honest about its limits. If full article text is unavailable, the UI should clearly frame the result as an excerpt-based AI summary or quick take rather than a full-article summary.

## User Stories

1. As a student developer, I want to fetch live news from one API, so that the project demonstrates real external data ingestion.
2. As a student developer, I want to save the raw API response as JSON, so that I can prove the ingestion step works and inspect source data later.
3. As a student developer, I want to transform raw API data into cleaned processed JSON, so that the UI consumes a stable, validated dataset.
4. As a student developer, I want to normalize categories into a small internal enum, so that filtering is reliable and simple.
5. As a student developer, I want to deduplicate articles by canonical identity, so that repeated or syndicated stories do not clutter the app.
6. As a student developer, I want to drop malformed articles before they reach the UI, so that the app remains stable.
7. As a student developer, I want to generate AI summaries from trusted cleaned fields only, so that the project avoids unnecessary hallucination risk.
8. As a student developer, I want fallback summaries when the LLM fails, so that one bad record does not break the pipeline.
9. As a student developer, I want to reuse previous summaries for unchanged articles, so that reruns stay cheap and fast.
10. As a student developer, I want the pipeline to run offline as scripts, so that the deployed UI never depends on live API or LLM calls.
11. As a student developer, I want file-based storage for both raw and processed artifacts, so that the architecture stays simple and assignment-friendly.
12. As a student developer, I want one canonical processed dataset, so that the app has a single trustworthy source of truth.
13. As a student developer, I want schema validation around processed artifacts, so that the UI fails clearly instead of unpredictably.
14. As a student developer, I want the app to keep working from the last known good processed file, so that demos are resilient to upstream failures.
15. As a user browsing the site, I want to see recent headlines on the homepage, so that I can quickly scan what is available.
16. As a user browsing the site, I want to filter headlines by category, so that I can focus on the type of news I care about.
17. As a user browsing the site, I want category selection reflected in the URL, so that views are shareable and bookmarkable.
18. As a user browsing the site, I want to open an article detail page, so that I can read more context about a selected story.
19. As a user browsing the site, I want to see the article source and publish date, so that I can judge relevance and credibility.
20. As a user browsing the site, I want a clear link to the original article, so that I can read the full source from the publisher.
21. As a user browsing the site, I want summary labels that distinguish AI summaries from fallback summaries, so that the app is transparent.
22. As a user browsing the site, I want the app to indicate when data was last updated, so that I understand freshness.
23. As a user browsing the site, I want the app to degrade gracefully when a category has few articles, so that sparse data does not look like a bug.
24. As a user browsing the site, I want the app to remain usable even if images are missing, so that layout quality does not depend on external media.
25. As an instructor or grader, I want the project to show a complete ingestion-to-UI pipeline, so that the assignment demonstrates end-to-end understanding.
26. As an instructor or grader, I want the architecture to be understandable from the README and repo structure, so that evaluation is straightforward.
27. As an instructor or grader, I want the project to have a small deterministic test suite, so that core behavior is verified without flaky external dependencies.
28. As an instructor or grader, I want the deployed app to work on Vercel without runtime writes, so that the deployment is reliable.
29. As a future maintainer, I want pipeline code, data loading code, and UI code separated into clear modules, so that the project stays navigable.
30. As a future maintainer, I want realistic test fixtures derived from actual API shapes, so that data pipeline tests exercise meaningful edge cases.
31. As a future maintainer, I want one top-level processed dataset contract with metadata and articles, so that UI code needs minimal glue logic.
32. As a future maintainer, I want run metrics such as fetched, dropped, deduped, and fallback counts, so that pipeline behavior is explainable.
33. As a future maintainer, I want environment validation to fail fast for pipeline-only secrets, so that the UI can still run without them.
34. As a future maintainer, I want stable internal article IDs and route-safe slugs, so that identity and routing concerns stay decoupled.
35. As a future maintainer, I want concise, factual summary rules, so that output quality is consistent across runs.

## Implementation Decisions

- The product is a small proof-of-concept, not a production news platform.
- The system uses one news API only.
- The system uses file-based storage only, with separate raw and processed JSON artifacts.
- The architecture is split into three layers:
  - pipeline/news processing
  - processed data loading
  - UI rendering
- The pipeline runs offline through scripts and is not executed during page requests.
- The deployed Next.js app reads processed JSON directly and does not sit behind an internal API route unless a later requirement forces one.
- The canonical processed dataset is the source of truth for the UI.
- New candidate artifacts are validated before replacing the canonical processed dataset.
- Processed records are UI-ready and should not require ad hoc repair logic inside page components.
- The processed dataset includes top-level metadata such as generation timestamp, source, categories, counts, and article list.
- Article identity is based on canonical URL when available, with a normalized source URL fallback.
- Articles without a usable URL are dropped from the main dataset.
- Routing uses a separate route-safe slug, while canonical identity remains on an internal ID.
- Slugs are generated from sanitized title text plus a short stable suffix derived from the canonical ID.
- Categories are normalized into a fixed small enum for v1.
- V1 supports three categories only: general, technology, and business.
- Category classification is handled by a deterministic mapping table, not by the LLM.
- Articles are sorted by publish timestamp descending.
- Sparse categories are allowed; the UI renders whatever validated articles exist.
- All stored timestamps use ISO 8601 UTC.
- Dates are formatted only at render time in the UI.
- AI summaries are generated only from cleaned trusted fields such as title, description, and excerpt/content when available.
- The summarizer never receives arbitrary raw JSON or HTML.
- The prompt must instruct the model to stay factual, neutral, concise, and source-grounded.
- Summary output is expected to be short, roughly 2 to 4 sentences when enough source material exists.
- If source material is too thin or the LLM fails, the system falls back to a shorter extractive summary.
- The UI must label excerpt-based output honestly and must not imply full-article summarization when full text is unavailable.
- Existing summaries are reused unless summary-relevant input fields materially change.
- Summary change detection is based on normalized title, description, and cleaned excerpt/content.
- The summarization provider is isolated behind a small adapter interface so the rest of the pipeline does not depend on provider-specific details.
- The Next.js UI uses server-side data loading for processed JSON.
- Interactive UI behavior should be minimal and isolated, with client components used only where necessary.
- Category filtering is URL-driven via search params.
- Detail pages resolve by slug and render a not-found state if the article is missing.
- Source attribution and the original article link are prominent on cards and detail pages.
- Images are optional metadata and must never be required for page usability.
- The README should explain the architecture, commands, env vars, limitations, and demo flow in a grading-friendly way.

## Testing Decisions

- Good tests should verify external behavior and data contracts, not internal implementation details.
- External dependencies must be fully mocked, including the news API and the LLM provider.
- The test suite should remain small and deterministic.
- The highest-risk seams should be tested first:
  - raw-to-normalized transformation
  - deduplication and repair behavior
  - fallback summarization behavior
  - processed dataset loading and validation
  - lightweight UI behavior for category filtering and article detail rendering
- Tests should use realistic fixture data based on actual API response shapes and processed dataset shapes.
- Pipeline logic should be tested in isolation from the UI.
- Data loading behavior should be tested separately from rendering.
- UI tests should focus on user-visible outcomes rather than internal component structure.
- Full browser E2E testing is not required for v1 unless explicitly requested by the instructor.
- The intended test stack is Vitest plus React Testing Library.

## Out of Scope

- User accounts
- Personalized recommendations
- Vector databases
- Search relevance systems
- Large-scale infrastructure
- Background job orchestration beyond simple scripts or optional lightweight scheduling
- Multiple news providers in v1
- Real-time updates
- Full in-app article rendering beyond available excerpt fields
- LLM-based category classification
- Complex analytics dashboards
- Admin panels
- Heavy animation or premium design polish as a functional requirement
- Production-grade observability beyond lightweight run reports and logs

## Further Notes

- The project should prioritize reliability and clarity over feature breadth.
- Vercel deployment is for the UI only; production runtime writes are intentionally avoided.
- Processed JSON may be committed to the repository for the assignment version to keep deployment simple and deterministic.
- The app should display a visible `Last updated` value from the latest successful pipeline run.
- The demo should show homepage headlines, category switching, detail page navigation, source attribution, summary labeling, and the offline-pipeline story.
- If time becomes constrained, cosmetic enhancements and automation should be cut before core pipeline integrity, schema validation, tests, and deployment.
If you want, I can also turn this into a shorter professor-facing PRD or split it into implementation tickets next.


yes


Professor-Facing PRD
Title: AI News Summarizer Proof-of-Concept

Overview
This project is a small end-to-end AI application for a class assignment. It demonstrates live news ingestion from one API, ETL transformation into cleaned JSON, LLM-based summarization, a user-facing Next.js interface, testing, and deployment on Vercel. The system is intentionally designed as a proof-of-concept with simple file-based storage and a deterministic offline pipeline.

Goal
Build a reliable news summarizer that:

fetches recent articles from one external news API
saves raw API output as JSON
transforms raw records into validated processed JSON
generates concise summaries using an LLM
displays articles and summaries in a Next.js UI
deploys safely on Vercel
Supported Tasks

browse recent headlines
filter articles by category
read AI-generated summaries
open article detail pages
follow links to original publisher articles
Architecture Summary

Offline pipeline fetches and processes news data
Raw and processed artifacts are stored as JSON files
One canonical processed dataset is committed and used by the app
The Next.js UI reads processed JSON directly
No live API or LLM calls occur during page requests
Vercel hosts the UI only
Data Flow

Fetch live news from one API
Save raw response to JSON
Normalize, validate, and deduplicate records
Generate AI summaries from cleaned trusted fields
Save processed dataset to JSON
Render processed dataset in Next.js
Key Product Decisions

Scope is intentionally limited to three categories in v1: general, technology, and business
Categories are normalized with a simple mapping table, not AI
Summaries are excerpt-based when full article text is unavailable
If AI summarization fails, the system falls back to a simpler extractive summary
Category selection is URL-based for shareable filtered views
Article detail pages use stable slugs but preserve internal canonical IDs
Testing Requirements

deterministic tests only
external API and LLM calls fully mocked
tests cover:
raw-to-processed transformation
deduplication and repair logic
fallback summarization behavior
processed dataset loading/validation
basic UI behavior for filtering and detail pages
Out of Scope

user accounts
recommendations
vector databases
multiple news providers
real-time updates
large-scale infrastructure
full in-app publisher article rendering
LLM-based category classification
Deployment

deployed on Vercel
processed JSON is precomputed and committed
app does not write files at runtime
visible Last updated timestamp communicates dataset freshness
Suggested Tickets
Set up project structure for pipeline, data loading, and UI layers.
Define schemas for raw API payloads, normalized records, and processed dataset.
Implement news ingestion from one API and save raw JSON.
Implement normalization, validation, category mapping, and deduplication.
Add summarizer adapter and fallback summarization behavior.
Build canonical processed dataset output with metadata and counts.
Build homepage with headline list and category filter.
Build article detail page with summary, metadata, and source link.
Add processed dataset loader and validation in the Next.js app.
Add deterministic tests for pipeline and UI seams.
Replace starter README with architecture, commands, env vars, and demo notes.
Deploy the app to Vercel using committed processed JSON.
If you want, I can turn these tickets into a GitHub issue checklist format next.


yes


## PRD: AI News Summarizer Proof-of-Concept

### Summary

Build a small end-to-end AI News Summarizer for a class assignment. The app should ingest live news from one API, save raw JSON, transform it into cleaned processed JSON, generate concise summaries with an LLM, display results in a Next.js UI, and deploy on Vercel.

### Goals

- Demonstrate live data ingestion from one news API
- Store both raw and processed data as JSON files
- Build a simple ETL pipeline for normalization, validation, and deduplication
- Add an AI summarization layer with fallback behavior
- Provide a user-facing UI for browsing, filtering, and reading summaries
- Keep the system small, deterministic, and demo-safe
- Deploy the UI on Vercel

### Supported Tasks

- Browse recent headlines
- Filter articles by category
- Read AI summaries
- Open article detail pages
- Visit the original publisher article

### Out of Scope

- User accounts
- Personalized recommendations
- Vector databases
- Multiple news providers in v1
- Real-time updates
- Full in-app rendering of publisher articles
- LLM-based category classification
- Large-scale infrastructure
- Admin panels
- Advanced analytics

### Architecture Overview

- Offline pipeline fetches news and writes file-based artifacts
- Raw API responses are stored as JSON
- Processed validated article records are stored as a canonical JSON dataset
- The Next.js UI reads processed JSON directly
- No live API or LLM calls happen during page requests
- Vercel hosts the UI only
- Processed JSON is committed for deterministic deployment in the assignment version

### Functional Requirements

- Fetch live news from one external API
- Save raw news data to JSON
- Transform raw records into cleaned processed JSON
- Normalize categories into a fixed internal set
- Deduplicate articles using stable canonical identity
- Drop invalid or incomplete records before UI consumption
- Generate short factual summaries using an LLM
- Fall back to an extractive summary when AI summarization fails
- Reuse summaries for unchanged articles when possible
- Show recent headlines on the homepage
- Support category filtering
- Support article detail pages
- Show source attribution and publish date
- Show a prominent link to the original article
- Display a visible `Last updated` timestamp
- Degrade gracefully when categories are sparse or images are missing

### Data Requirements

- File-based storage only
- Separate raw and processed JSON artifacts
- One canonical processed dataset used by the UI
- Processed dataset includes:
  - generation timestamp
  - source identifier
  - available categories
  - counts/metrics
  - article list
- Each processed article includes:
  - internal `id`
  - route-safe `slug`
  - title
  - source name
  - published timestamp
  - category
  - URL
  - summary
  - summary type
  - optional description, image URL, author, cleaned excerpt

### Testing Requirements

- Use deterministic tests only
- Fully mock external API and LLM dependencies
- Cover:
  - raw-to-processed transformation
  - deduplication and repair rules
  - fallback summarization behavior
  - processed dataset loading and validation
  - lightweight UI behavior for filter and detail page flows
- Prefer Vitest + React Testing Library
- Do not add full browser E2E unless explicitly required

### Deployment Requirements

- Deploy UI on Vercel
- Avoid runtime filesystem writes in production
- Serve committed processed JSON artifacts
- Keep the deployed app functional without requiring live secrets at runtime

### Implementation Checklist

- [ ] Set up project structure for pipeline, data loading, and UI layers
- [ ] Define schemas for raw API data, normalized records, and processed dataset
- [ ] Integrate one news API for ingestion
- [ ] Save raw API response to JSON
- [ ] Implement normalization and validation rules
- [ ] Implement category mapping for `general`, `technology`, and `business`
- [ ] Implement stable article identity and deduplication
- [ ] Implement slug generation for detail routes
- [ ] Add summarizer adapter for one LLM provider
- [ ] Add fallback summarization behavior
- [ ] Reuse summaries for unchanged articles where possible
- [ ] Build canonical processed dataset output
- [ ] Add run metadata and counts to processed output
- [ ] Build homepage headline list
- [ ] Build category filter using URL search params
- [ ] Build article detail page
- [ ] Add source attribution and original article links
- [ ] Add visible `Last updated` timestamp
- [ ] Add processed dataset loader with validation
- [ ] Add pipeline/data/UI tests
- [ ] Replace starter README with assignment-focused documentation
- [ ] Deploy to Vercel

### Notes

- This is a proof-of-concept, not a production news platform.
- The app should be honest when summaries are based on excerpts rather than full article text.
- If time becomes limited, cosmetic work and automation should be cut before pipeline correctness, tests, and deployment.
If you want, I can also convert this into:

a GitHub Projects task breakdown
implementation phases by week
a submission-ready README outline

https://github.com/Aishusrinath/AI-News_Summarizer.git


Do you want me to use this repo URL to do one of these?

format the PRD as a GitHub issue ready to paste into that repo
generate implementation issues/checklists for that repo
inspect the repo and tailor the PRD to its current codebase
help you push the current local changes to that repo
If you want, I can start with option 1 right away.


generate implementation issues/checklists for that repo


Below is a GitHub-issue-friendly implementation breakdown for AI-News_Summarizer. Each issue is scoped to a clear deliverable and includes a checklist you can paste directly into GitHub.

Issue 1: Set Up Project Structure And Core Scripts
## Summary

Create the base project structure for the offline pipeline, processed data loading, and Next.js UI.

## Goals

- Separate pipeline logic, data loading, and UI layers
- Add a clear script surface for local development and pipeline execution
- Prepare the repo for schema-first implementation

## Checklist

- [ ] Create folders for raw, processed, and temporary data artifacts
- [ ] Create folders for pipeline modules, data loaders, and UI components
- [ ] Add `pipeline`, `pipeline:fetch`, `pipeline:process`, and `pipeline:summarize` scripts
- [ ] Add `test` and `test:watch` scripts
- [ ] Ensure the README references the primary commands
- [ ] Confirm the repo structure matches the intended architecture

## Acceptance Criteria

- Project structure clearly separates pipeline logic, processed data access, and UI rendering
- NPM scripts exist for development, pipeline execution, testing, and build
- Repo structure is understandable from a quick glance
Issue 2: Define Data Schemas And Contracts
## Summary

Define the schemas for raw API payloads, normalized article records, and the final processed dataset.

## Goals

- Lock the data contract before expanding implementation
- Validate processed artifacts before UI usage
- Keep the UI dependent only on trusted processed records

## Checklist

- [ ] Define schema for raw news API response
- [ ] Define schema for normalized intermediate article records
- [ ] Define schema for processed article records
- [ ] Define schema for top-level processed dataset metadata
- [ ] Add category enum for `general`, `technology`, and `business`
- [ ] Add summary type enum for `ai` and `fallback`
- [ ] Export shared TypeScript types from the schema module

## Acceptance Criteria

- Raw, normalized, and processed data each have explicit contracts
- Processed dataset can be validated before UI consumption
- Shared types are available for pipeline and UI code
Issue 3: Implement News API Ingestion
## Summary

Connect one news API and save the raw response as JSON.

## Goals

- Fetch live news from one provider
- Keep the integration minimal and deterministic
- Persist raw responses for debugging and ETL input

## Checklist

- [ ] Choose one news API for v1
- [ ] Validate required fields are available in real payloads
- [ ] Add environment validation for the API key
- [ ] Implement fetch logic for recent articles
- [ ] Save raw API response to a raw JSON artifact
- [ ] Add basic run logging for fetched count and failures

## Acceptance Criteria

- A single command can fetch live news from one API
- Raw JSON is saved locally for later processing
- Missing secrets fail fast with a clear error
Issue 4: Build Normalization And ETL Processing
## Summary

Transform raw news records into normalized article records and produce cleaned processed output.

## Goals

- Clean and normalize source data
- Apply category mapping
- Remove malformed records before they reach the UI

## Checklist

- [ ] Clean title, description, and excerpt/content fields
- [ ] Normalize category values into the internal enum
- [ ] Parse and standardize timestamps as ISO 8601 UTC
- [ ] Drop records missing required identity or display fields
- [ ] Build stable internal IDs from canonical URLs
- [ ] Generate route-safe slugs from title + stable suffix
- [ ] Add basic quality scoring for dedupe decisions

## Acceptance Criteria

- Raw records are transformed into normalized records with stable identity
- Invalid or incomplete records are dropped or repaired before final output
- Timestamps and categories are normalized consistently
Issue 5: Implement Deduplication And Candidate Dataset Output
## Summary

Deduplicate normalized articles and write a candidate dataset for summarization.

## Goals

- Prevent duplicate stories from reaching the final dataset
- Prefer better-quality or newer records on collisions
- Prepare a stable candidate artifact for the summary step

## Checklist

- [ ] Deduplicate normalized records by canonical article ID
- [ ] Prefer higher-quality records when duplicates collide
- [ ] Prefer newer records when quality is similar
- [ ] Sort deduplicated records by publish date descending
- [ ] Write candidate artifact to temporary storage
- [ ] Include processing counts in candidate metadata

## Acceptance Criteria

- Duplicate stories are removed consistently
- Candidate dataset is stable and ready for summarization
- Processing counts are available for debugging
Issue 6: Add LLM Summarization Adapter And Fallback Logic
## Summary

Implement the AI summarization layer behind a small adapter and add fallback summaries for failures.

## Goals

- Generate concise summaries with one LLM provider
- Keep the provider-specific code isolated
- Prevent one summary failure from breaking the whole run

## Checklist

- [ ] Define a summarizer interface for processed inputs
- [ ] Implement one provider adapter
- [ ] Restrict LLM input to cleaned trusted fields only
- [ ] Add a factual, concise, source-grounded prompt
- [ ] Enforce fallback summary generation when the provider fails
- [ ] Mark each summary with `ai` or `fallback`
- [ ] Reuse summaries when summary-relevant inputs have not changed

## Acceptance Criteria

- Summaries are generated through one adapter interface
- Failed LLM calls produce valid fallback summaries
- Summary type is persisted in the processed dataset
Issue 7: Build Canonical Processed Dataset
## Summary

Produce the final processed dataset used by the UI and treat it as the canonical artifact.

## Goals

- Build one top-level processed JSON file for the app
- Include run metadata and aggregate counts
- Promote only validated artifacts to canonical status

## Checklist

- [ ] Build top-level processed dataset object
- [ ] Include `generatedAt`, source, categories, counts, and articles
- [ ] Validate the processed dataset before promotion
- [ ] Write the final dataset to the canonical processed JSON file
- [ ] Preserve the canonical dataset as the app’s source of truth
- [ ] Add a lightweight run report artifact

## Acceptance Criteria

- The app has one canonical processed dataset to read from
- Processed output includes both article data and run metadata
- Invalid candidate output does not replace the canonical dataset
Issue 8: Add Server-Side Data Loading In Next.js
## Summary

Load the processed dataset directly in the Next.js app and keep data access server-side.

## Goals

- Avoid an unnecessary internal API route
- Keep file I/O out of client components
- Validate processed data at load time

## Checklist

- [ ] Add server-side processed dataset loader
- [ ] Validate processed JSON using shared schema
- [ ] Add article lookup by slug
- [ ] Handle missing article slugs with a proper not-found flow
- [ ] Keep page components dependent on typed processed records only

## Acceptance Criteria

- UI reads the canonical processed dataset directly
- Data loading happens server-side
- Invalid or missing articles are handled cleanly
Issue 9: Build Homepage UI
## Summary

Create the homepage for browsing recent headlines and switching categories.

## Goals

- Display validated articles from processed JSON
- Support category filtering
- Surface freshness and source transparency

## Checklist

- [ ] Build homepage layout for recent headlines
- [ ] Render article cards from processed records
- [ ] Show category filter controls
- [ ] Use URL search params for category selection
- [ ] Show `Last updated` from processed dataset metadata
- [ ] Show source name and publish date on cards
- [ ] Show summary label on cards
- [ ] Add graceful empty state for sparse categories

## Acceptance Criteria

- Users can browse headlines and filter by category
- The selected category is reflected in the URL
- Homepage shows freshness and attribution clearly
Issue 10: Build Article Detail Page
## Summary

Create a detail page for each article using the processed dataset.

## Goals

- Show expanded context for a selected article
- Keep the experience honest about excerpt-based summaries
- Preserve source attribution and outbound navigation

## Checklist

- [ ] Build detail page route using article slug
- [ ] Show title, source, publish date, category, and summary
- [ ] Show description and cleaned excerpt when available
- [ ] Show clear link to the original article
- [ ] Handle missing articles with a not-found page
- [ ] Keep detail page usable even when optional fields are absent

## Acceptance Criteria

- Users can open detail pages from homepage cards
- Detail pages render from processed data only
- Original source remains prominent
Issue 11: Add Testing For Pipeline And UI Seams
## Summary

Create a small deterministic test suite covering the highest-risk seams.

## Goals

- Verify core data behavior without flaky external dependencies
- Keep tests focused on external behavior
- Use realistic fixtures instead of toy-only mocks

## Checklist

- [ ] Add test runner configuration
- [ ] Add realistic raw API fixture
- [ ] Add realistic processed dataset fixture
- [ ] Test raw-to-normalized transformation
- [ ] Test deduplication and repair behavior
- [ ] Test fallback summarization behavior
- [ ] Test processed dataset loading/validation
- [ ] Add lightweight UI tests for filter and detail flows
- [ ] Mock external API and LLM dependencies fully

## Acceptance Criteria

- Tests are deterministic and run locally
- Highest-risk seams are covered
- No live API or LLM dependency is required for tests
Issue 12: Finalize README And Deployment
## Summary

Replace starter documentation and complete the Vercel deployment path.

## Goals

- Make the project easy to understand and grade
- Document architecture, commands, and limitations clearly
- Deploy the UI safely on Vercel using committed processed data

## Checklist

- [ ] Replace default README with project-specific documentation
- [ ] Document architecture overview and offline pipeline flow
- [ ] Document required env vars and when they are needed
- [ ] Document primary commands: `pipeline`, `test`, `dev`, `build`
- [ ] Document limitations and excerpt-based summary honesty
- [ ] Verify Vercel deployment reads committed processed JSON
- [ ] Confirm the deployed app does not depend on runtime writes
- [ ] Prepare a short demo flow for grading

## Acceptance Criteria

- README is assignment-ready and operationally clear
- App deploys on Vercel from committed processed artifacts
- Demo path is easy to explain and execute
If you want, I can next turn these into:

a prioritized order of implementation
good first issue vs core issue labels
a milestone plan with Phase 1 / Phase 2 / Phase 3

Prd to Issues Write a PRD for an AI News Summarizer student project.

Requirements:
- small proof-of-concept
- raw data ingestion from one news API
- ETL transformation into cleaned JSON
- file-based storage for raw and processed data
- AI summarization layer using an LLM
- user-facing UI in Next.js
- deployment on Vercel
- clear supported tasks and out-of-scope section
- architecture overview
- testing requirements
- GitHub issue-friendly format



1 previous message
To use prd-to-issues properly, I need the parent PRD GitHub issue number or URL first.

Send either:

the PRD issue URL, or
the issue number in your repo
If you don’t have the PRD posted as a GitHub issue yet, I can switch and write the PRD body first, then break it into vertical-slice issues after.


## Problem Statement

As a student, I need a small but complete AI application for a class assignment that demonstrates practical full-stack and AI integration skills. The project should show a clear end-to-end workflow from live data ingestion to processed outputs, AI summarization, user-facing presentation, testing, and deployment.

The application should stay intentionally small and reliable. It is a proof-of-concept, not a production news platform.

## Solution

Build an AI News Summarizer student project with an offline batch pipeline and a read-only Next.js UI.

The system will:
- fetch recent news from one external news API
- save the raw API response to JSON
- transform raw records into cleaned and validated processed JSON
- generate concise summaries using an LLM
- fall back to a simpler extractive summary if AI summarization fails
- display articles and summaries in a Next.js interface
- deploy the UI on Vercel using precomputed processed data

The design should favor simplicity, determinism, and demo safety. The deployed app should not call the news API or the LLM during page requests.

## User Stories

1. As a student developer, I want to fetch live news from one API, so that the project demonstrates real-world data ingestion.
2. As a student developer, I want to save raw API responses as JSON, so that I can prove ingestion works and inspect the source payload.
3. As a student developer, I want to transform raw records into cleaned processed JSON, so that the UI consumes a stable internal dataset.
4. As a student developer, I want to normalize categories into a small approved set, so that filtering is reliable and easy to understand.
5. As a student developer, I want to deduplicate repeated articles, so that the dataset is cleaner and summary calls are not wasted.
6. As a student developer, I want to assign stable internal article IDs, so that records remain identifiable across runs.
7. As a student developer, I want route-safe slugs for detail pages, so that article pages are readable and stable.
8. As a student developer, I want to drop invalid or incomplete records before they reach the final dataset, so that the UI remains reliable.
9. As a student developer, I want to generate short factual summaries using an LLM, so that the app demonstrates an AI layer in the workflow.
10. As a student developer, I want summaries to be based only on cleaned trusted fields, so that they remain grounded in the available source content.
11. As a student developer, I want fallback summaries when the LLM fails, so that one failed call does not break the pipeline.
12. As a student developer, I want file-based storage for both raw and processed artifacts, so that the architecture stays simple.
13. As a student developer, I want the pipeline to run offline through scripts, so that the deployed UI remains fast and deterministic.
14. As a student developer, I want one canonical processed dataset, so that the app has a single source of truth.
15. As a student developer, I want run metadata and counts in the processed dataset, so that pipeline behavior is explainable.
16. As a user, I want to browse recent headlines, so that I can quickly scan the current dataset.
17. As a user, I want to filter articles by category, so that I can focus on topics I care about.
18. As a user, I want category selection to be reflected in the URL, so that filtered views are shareable and bookmarkable.
19. As a user, I want to open an article detail page, so that I can read more context about a selected story.
20. As a user, I want to read a concise AI summary, so that I can understand the article quickly.
21. As a user, I want to see source name and publish date, so that I can judge relevance and credibility.
22. As a user, I want a clear link to the original article, so that I can read the full publisher version.
23. As a user, I want the app to show when the dataset was last updated, so that I understand freshness.
24. As a user, I want missing images or sparse categories to degrade gracefully, so that the UI still feels usable.
25. As an instructor, I want the project to show a clear end-to-end architecture, so that it demonstrates practical engineering skill rather than isolated features.
26. As an instructor, I want the project to include tests, so that core behavior is verified.
27. As an instructor, I want the app deployed on Vercel, so that the project is complete and accessible.

## Implementation Decisions

- The project is a small proof-of-concept, not a production news platform.
- Only one external news API will be used in v1.
- The system will use file-based storage only.
- Raw API responses and processed outputs will be stored separately.
- The architecture will be split into three layers:
  - news pipeline and ETL logic
  - processed data loading
  - UI rendering
- The pipeline will run offline via scripts.
- The Next.js app will read processed JSON directly and will not depend on an internal API route unless later required.
- The canonical processed dataset will be the app’s source of truth.
- Processed records will be UI-ready and should not need repair logic inside page components.
- Category normalization will use a deterministic mapping table, not AI classification.
- V1 will support three categories: general, technology, and business.
- Article identity will be derived from canonical URL when possible, with normalized source URL fallback.
- Articles without a usable URL will be excluded from the main dataset.
- Routing will use a route-safe slug separate from the internal canonical ID.
- Slugs will be generated from sanitized title text plus a short stable suffix.
- All timestamps will be stored in ISO 8601 UTC format.
- Articles will be sorted by published date descending.
- Sparse categories are acceptable; the UI will render whatever validated articles exist.
- AI summaries will use only cleaned trusted fields such as title, description, and excerpt/content when available.
- The summarizer will be isolated behind a small adapter interface so provider-specific logic remains contained.
- Summary prompts must enforce factual, concise, source-grounded output.
- If source content is thin or the summarizer fails, the system will use a fallback extractive summary.
- The app must label summaries honestly when only excerpts are available.
- The deployed Vercel app will serve precomputed processed JSON and will not write files at runtime.
- The UI will show a visible Last updated timestamp and prominent source attribution.

## Testing Decisions

- Good tests should verify external behavior and data contracts rather than implementation details.
- External API calls and LLM calls must be fully mocked.
- The test suite should stay small and deterministic.
- Required testing areas:
  - raw-to-normalized transformation
  - deduplication and repair behavior
  - fallback summarization behavior
  - processed dataset validation and loading
  - lightweight UI behavior for category filtering and article detail rendering
- Tests should use realistic fixture data shaped like actual API responses and processed dataset artifacts.
- Pipeline logic should be tested separately from UI rendering.
- UI tests should verify user-visible behavior instead of internal component structure.
- Full browser end-to-end testing is out of scope unless explicitly required.
- A lightweight setup such as Vitest and React Testing Library is sufficient for v1.

## Supported Tasks

- Browse recent headlines
- Filter articles by category
- Read AI summaries
- Open article detail pages
- Visit original publisher articles

## Out of Scope

- User accounts
- Personalized recommendations
- Vector databases
- Multiple news providers
- Real-time updates
- Full in-app rendering of publisher articles
- LLM-based category classification
- Large-scale infrastructure
- Admin tooling
- Advanced analytics
- Heavy product polish beyond what is needed for a clear demo

## Further Notes

- The project should prioritize reliability and clarity over feature breadth.
- Processed JSON may be committed to the repository for the assignment version to simplify deployment.
- The UI should remain honest when summaries are based on excerpts rather than full article text.
- If time becomes limited, cosmetic improvements and optional automation should be cut before pipeline correctness, testing, and deployment.
- The expected demo flow is:
  - open homepage
  - show Last updated
  - switch categories
  - open a detail page
  - point out AI summary labeling and source attribution
  - explain that the UI is backed by a validated offline pipeline


Here’s a tracer-bullet breakdown of that PRD into thin, independently grabbable issues. Each slice is meant to cut through schema, pipeline, data loading, UI, and tests enough to be demoable on its own.

Title: Bootstrap canonical dataset and homepage from local processed JSON
Type: AFK
Blocked by: None
User stories covered: 3, 12, 14, 16, 21, 23, 25
This slice creates the minimum end-to-end path where the app reads a committed processed dataset, validates it, and renders a homepage with source/date/last-updated metadata.

Title: Add category filtering with normalized enum and URL state
Type: AFK
Blocked by: 1
User stories covered: 4, 16, 17, 24
This slice adds the internal category contract and makes homepage filtering work through URL search params.

Title: Add article detail page with stable slug routing
Type: AFK
Blocked by: 1
User stories covered: 6, 7, 19, 21, 22
This slice introduces route-safe slugs, article lookup, detail rendering, and not-found behavior.

Title: Implement raw news ingestion to file storage
Type: AFK
Blocked by: None
User stories covered: 1, 2, 12, 13, 25
This slice connects one real news API, validates env setup, and writes raw JSON artifacts with basic run reporting.

Title: Build ETL normalization and deduplication pipeline
Type: AFK
Blocked by: 4
User stories covered: 3, 4, 5, 6, 8, 12, 14, 15
This slice transforms raw records into normalized, deduped, validated processed candidates with stable IDs, timestamps, and category mapping.

Title: Generate processed dataset and promote canonical artifact
Type: AFK
Blocked by: 5
User stories covered: 3, 12, 14, 15, 23
This slice writes the final processed dataset used by the app, including generatedAt, counts, categories, and articles.

Title: Add LLM summarization adapter with fallback summaries
Type: AFK
Blocked by: 5
User stories covered: 9, 10, 11, 20
This slice adds one provider-backed summarizer plus fallback behavior when the provider fails or source content is too thin.

Title: Reuse unchanged summaries across pipeline runs
Type: AFK
Blocked by: 6, 7
User stories covered: 9, 10, 11, 14, 15
This slice adds change detection on summary inputs so reruns avoid unnecessary AI calls.

Title: Surface summary labels and excerpt honesty in the UI
Type: AFK
Blocked by: 3, 7
User stories covered: 20, 21, 22, 23, 24
This slice makes the product framing explicit by labeling AI vs fallback summaries and keeping source attribution prominent.

Title: Add deterministic pipeline and UI test coverage
Type: AFK
Blocked by: 1, 2, 3, 5, 7
User stories covered: 25, 26
This slice adds fixture-backed tests for transformation, deduplication, fallback summaries, processed dataset loading, and lightweight UI flows.

Title: Finalize README, scripts, and Vercel deployment path
Type: AFK
Blocked by: 1, 6, 9, 10
User stories covered: 13, 23, 25, 26, 27
This slice closes the loop with documented commands, env expectations, demo notes, and verified Vercel deployment using committed processed JSON.

My quick take: this granularity feels about right for a student project. It keeps the slices thin enough to finish, but each one still delivers something visible or verifiable.

Questions:

Does this feel too coarse or too fine?
Are the dependency relationships right?
Should any of these be merged or split?
Are you okay with all of them being AFK, or do you want any decision points marked HITL?

push parent github issue into repo



1 previous message
I can’t create the GitHub issue yet because gh is installed but your GitHub CLI auth is invalid for account Aishusrinath.

Run this first in the repo terminal:

gh auth login -h github.com
Then verify:

gh auth status
Once that succeeds, I can create the parent issue for you immediately. If you want, send me “done” after re-auth and I’ll give you the exact gh issue create command or create the body for you to paste.


yes


Run this after gh auth login succeeds:

gh issue create --repo Aishusrinath/AI-News_Summarizer --title "PRD: AI News Summarizer Student Project" --body-file -
Then paste this as the body:

# PRD: AI News Summarizer Student Project

## Summary

Build a small proof-of-concept AI News Summarizer for a class assignment. The project should demonstrate an end-to-end workflow across live news ingestion, ETL transformation, AI summarization, file-based storage, a Next.js user interface, testing, and deployment on Vercel.

This is intentionally a student-scale project, not a production news platform.

## Problem Statement

As a student, I need a compact but credible AI application that shows practical engineering and AI integration skills. The project should be easy to explain, easy to demo, and scoped tightly enough to finish reliably.

The app should:
- fetch live news from one API
- save raw data as JSON
- transform raw data into cleaned processed JSON
- generate AI summaries with an LLM
- present results in a Next.js UI
- be tested
- deploy on Vercel

## Goals

- Demonstrate live external data ingestion
- Build an offline ETL pipeline that produces validated processed JSON
- Add an AI summarization layer with fallback behavior
- Serve processed results through a small Next.js UI
- Support a reliable demo and simple deployment workflow
- Keep the architecture deterministic and assignment-friendly

## Supported Tasks

- Browse recent headlines
- Filter by category
- Read AI summaries
- Open article detail pages
- Visit the original publisher article

## Architecture Overview

The system will use an offline pipeline plus a read-only frontend.

### Pipeline
- Fetch recent news from one external API
- Save the raw response as JSON
- Normalize, validate, and deduplicate records
- Generate summaries using an LLM
- Save the final processed dataset as canonical JSON

### Frontend
- Next.js UI reads processed JSON directly
- Homepage shows recent articles and category filters
- Detail pages show expanded article context
- Source attribution and original article link are always visible

### Deployment
- Vercel hosts the UI only
- No live API or LLM calls occur during page requests
- No runtime filesystem writes in production
- Processed JSON can be committed for deterministic deployment

## Product And Technical Decisions

- This project is a small proof-of-concept
- Only one news API will be used in v1
- Storage is file-based only
- Raw and processed data are stored separately
- One canonical processed dataset is the source of truth for the UI
- Categories are normalized into a small fixed set
- V1 categories are:
  - `general`
  - `technology`
  - `business`
- Article identity is based on stable canonical URLs
- Detail page routing uses a route-safe slug
- AI summaries use only cleaned trusted fields
- If AI summarization fails, the system falls back to an extractive summary
- The UI must honestly label excerpt-based summaries
- The app must show a visible `Last updated` timestamp

## Testing Requirements

The test suite should be small and deterministic.

### Must cover
- Raw-to-processed transformation
- Deduplication and repair behavior
- Fallback summarization behavior
- Processed dataset validation/loading
- Lightweight UI behavior for category filtering and article detail rendering

### Testing rules
- Mock external API calls
- Mock LLM calls
- Focus on external behavior, not implementation details
- Use realistic fixture data where possible

## Out of Scope

- User accounts
- Personalized recommendations
- Vector databases
- Multiple news providers
- Real-time updates
- Full in-app rendering of publisher articles
- LLM-based category classification
- Large-scale infrastructure
- Admin tooling
- Advanced analytics
- Heavy product polish beyond demo needs

## Success Criteria

- Live news is fetched from one API
- Raw JSON is saved successfully
- Processed JSON is created successfully
- AI summaries are generated or cleanly fall back
- Users can browse headlines and filter by category
- Users can open article detail pages
- The app is tested with a small deterministic suite
- The app is deployed on Vercel
- The demo flow clearly shows the end-to-end pipeline story

## Child Issues

- [ ] Set up project structure and scripts
- [ ] Define schemas for raw, normalized, and processed data
- [ ] Implement news API ingestion
- [ ] Build normalization and ETL processing
- [ ] Add deduplication and candidate dataset generation
- [ ] Implement LLM summarization adapter and fallback logic
- [ ] Build canonical processed dataset output
- [ ] Add server-side processed data loading in Next.js
- [ ] Build homepage UI with category filtering
- [ ] Build article detail page
- [ ] Add deterministic tests for pipeline and UI seams
- [ ] Finalize README and Vercel deployment

## Notes

- Reliability is more important than feature breadth
- The simplest valid deployment path is preferred over automation-heavy infrastructure
- If time becomes limited, cut cosmetics and optional automation before cutting core pipeline correctness, testing, or deployment
Then finish input with:

Ctrl+Z then Enter in PowerShell
If you want, after you create it, send me the issue number and I’ll turn the child issues into gh issue create commands that reference the parent.


https://github.com/Aishusrinath/AI-News_Summarizer/issues/1


Perfect. Parent PRD issue is #1.

Now the prd-to-issues flow can continue properly. Here’s the approved vertical-slice breakdown, now tied to parent PRD #1:

Bootstrap canonical dataset and homepage from local processed JSON
Type: AFK
Blocked by: None
User stories covered: 3, 12, 14, 16, 21, 23, 25

Add category filtering with normalized enum and URL state
Type: AFK
Blocked by: 1
User stories covered: 4, 16, 17, 24

Add article detail page with stable slug routing
Type: AFK
Blocked by: 1
User stories covered: 6, 7, 19, 21, 22

Implement raw news ingestion to file storage
Type: AFK
Blocked by: None
User stories covered: 1, 2, 12, 13, 25

Build ETL normalization and deduplication pipeline
Type: AFK
Blocked by: 4
User stories covered: 3, 4, 5, 6, 8, 12, 14, 15

Generate processed dataset and promote canonical artifact
Type: AFK
Blocked by: 5
User stories covered: 3, 12, 14, 15, 23

Add LLM summarization adapter with fallback summaries
Type: AFK
Blocked by: 5
User stories covered: 9, 10, 11, 20

Reuse unchanged summaries across pipeline runs
Type: AFK
Blocked by: 6, 7
User stories covered: 9, 10, 11, 14, 15

Surface summary labels and excerpt honesty in the UI
Type: AFK
Blocked by: 3, 7
User stories covered: 20, 21, 22, 23, 24

Add deterministic pipeline and UI test coverage
Type: AFK
Blocked by: 1, 2, 3, 5, 7
User stories covered: 25, 26

Finalize README, scripts, and Vercel deployment path
Type: AFK
Blocked by: 1, 6, 9, 10
User stories covered: 13, 23, 25, 26, 27

Before I generate the issue creation commands, quick check:

Does this granularity still feel right?
Are these dependency relationships okay?
Do you want me to proceed and give you ready-to-run gh issue create commands for issues #2 onward?

how to run them


Run them from the repo root d:\ai-news-summarizer.

If Vitest is installed:

npx vitest run
Run only the ETL tests:

npx vitest run src/lib/news/__tests__
Run one specific file:

npx vitest run src/lib/news/__tests__/normalize-articles.test.ts
Run in watch mode while doing TDD:

npx vitest
If your package.json scripts are available and dependencies are installed, you can also use:

npm run test
npm run test:watch
Recommended TDD flow:

run one file
npx vitest run src/lib/news/__tests__/normalize-articles.test.ts
see the failing test
make the minimal code change
rerun the same file
move to the next test file
If npx vitest fails with “not found”, then the dev dependencies were not installed yet, and you’ll need:

npm install
first.


PS D:\ai-news-summarizer> npx vitest run

 RUN  v3.2.4 D:/ai-news-summarizer


⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Suites 5 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/lib/news/__tests__/dedupe-articles.test.ts [ src/lib/news/__tests__/dedupe-articles.test.ts ]
Error: Failed to resolve import "@/lib/news/dedupe-articles" from "src/lib/news/__tests__/dedupe-articles.test.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: D:/ai-news-summarizer/src/lib/news/__tests__/dedupe-articles.test.ts:1:31
  1  |  import { dedupeArticles } from "@/lib/news/dedupe-articles";
     |                                  ^
  2  |  import { normalizeArticles } from "@/lib/news/normalize-articles";
  3  |  describe("dedupeArticles", () => {
 ❯ TransformPluginContext._formatLog node_modules/vite/dist/node/chunks/config.js:29003:43
 ❯ TransformPluginContext.error node_modules/vite/dist/node/chunks/config.js:29000:14
 ❯ normalizeUrl node_modules/vite/dist/node/chunks/config.js:27123:18
 ❯ node_modules/vite/dist/node/chunks/config.js:27181:32
 ❯ TransformPluginContext.transform node_modules/vite/dist/node/chunks/config.js:27149:4
 ❯ EnvironmentPluginContainer.transform node_modules/vite/dist/node/chunks/config.js:28801:14    
 ❯ loadAndTransform node_modules/vite/dist/node/chunks/config.js:22670:26

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  src/lib/news/__tests__/normalize-articles.test.ts [ src/lib/news/__tests__/normalize-articles.test.ts ]
Error: Failed to resolve import "@/lib/news/__tests__/fixtures/raw-api-response.json" from "src/lib/news/__tests__/normalize-articles.test.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: D:/ai-news-summarizer/src/lib/news/__tests__/normalize-articles.test.ts:1:27
  1  |  import rawApiResponse from "@/lib/news/__tests__/fixtures/raw-api-response.json";        
     |                              ^
  2  |  import { normalizeArticles } from "@/lib/news/normalize-articles";
  3  |  describe("normalizeArticles", () => {
 ❯ TransformPluginContext._formatLog node_modules/vite/dist/node/chunks/config.js:29003:43
 ❯ TransformPluginContext.error node_modules/vite/dist/node/chunks/config.js:29000:14
 ❯ normalizeUrl node_modules/vite/dist/node/chunks/config.js:27123:18
 ❯ node_modules/vite/dist/node/chunks/config.js:27181:32
 ❯ TransformPluginContext.transform node_modules/vite/dist/node/chunks/config.js:27149:4
 ❯ EnvironmentPluginContainer.transform node_modules/vite/dist/node/chunks/config.js:28801:14    
 ❯ loadAndTransform node_modules/vite/dist/node/chunks/config.js:22670:26

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  src/lib/news/__tests__/select-top-stories.test.ts [ src/lib/news/__tests__/select-top-stories.test.ts ]
Error: Failed to resolve import "@/lib/news/select-top-stories" from "src/lib/news/__tests__/select-top-stories.test.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: D:/ai-news-summarizer/src/lib/news/__tests__/select-top-stories.test.ts:2:33
  1  |  import { selectTopStories } from "@/lib/news/select-top-stories";
     |                                    ^
  2  |  describe("selectTopStories", () => {
  3  |    it("returns only the requested number of top stories from an already sorted list", () => {
 ❯ TransformPluginContext._formatLog node_modules/vite/dist/node/chunks/config.js:29003:43
 ❯ TransformPluginContext.error node_modules/vite/dist/node/chunks/config.js:29000:14
 ❯ normalizeUrl node_modules/vite/dist/node/chunks/config.js:27123:18
 ❯ node_modules/vite/dist/node/chunks/config.js:27181:32
 ❯ TransformPluginContext.transform node_modules/vite/dist/node/chunks/config.js:27149:4
 ❯ EnvironmentPluginContainer.transform node_modules/vite/dist/node/chunks/config.js:28801:14    
 ❯ loadAndTransform node_modules/vite/dist/node/chunks/config.js:22670:26

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

 FAIL  src/lib/news/__tests__/summarize-articles.test.ts [ src/lib/news/__tests__/summarize-articles.test.ts ]
Error: Failed to resolve import "@/lib/news/summarize-articles" from "src/lib/news/__tests__/summarize-articles.test.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: D:/ai-news-summarizer/src/lib/news/__tests__/summarize-articles.test.ts:2:34
  1  |  import { summarizeArticles } from "@/lib/news/summarize-articles";
     |                                     ^
  2  |  describe("summarizeArticles", () => {
  3  |    it("falls back to an extractive summary when the summarizer fails", async () => {      
 ❯ TransformPluginContext._formatLog node_modules/vite/dist/node/chunks/config.js:29003:43
 ❯ TransformPluginContext.error node_modules/vite/dist/node/chunks/config.js:29000:14
 ❯ normalizeUrl node_modules/vite/dist/node/chunks/config.js:27123:18
 ❯ node_modules/vite/dist/node/chunks/config.js:27181:32
 ❯ TransformPluginContext.transform node_modules/vite/dist/node/chunks/config.js:27149:4
 ❯ EnvironmentPluginContainer.transform node_modules/vite/dist/node/chunks/config.js:28801:14    
 ❯ loadAndTransform node_modules/vite/dist/node/chunks/config.js:22670:26

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

 FAIL  src/lib/data/__tests__/load-articles.test.ts [ src/lib/data/__tests__/load-articles.test.ts ]
Error: Failed to resolve import "@/lib/data/load-articles" from "src/lib/data/__tests__/load-articles.test.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: D:/ai-news-summarizer/src/lib/data/__tests__/load-articles.test.ts:3:45
  1  |  import path from "node:path";
  2  |  import { loadProcessedDatasetFromFile } from "@/lib/data/load-articles";
     |                                                ^
  3  |  describe("loadProcessedDatasetFromFile", () => {
  4  |    it("validates fixture-backed processed data", async () => {
 ❯ TransformPluginContext._formatLog node_modules/vite/dist/node/chunks/config.js:29003:43       
 ❯ TransformPluginContext.error node_modules/vite/dist/node/chunks/config.js:29000:14
 ❯ normalizeUrl node_modules/vite/dist/node/chunks/config.js:27123:18
 ❯ node_modules/vite/dist/node/chunks/config.js:27181:32
 ❯ TransformPluginContext.transform node_modules/vite/dist/node/chunks/config.js:27149:4
 ❯ EnvironmentPluginContainer.transform node_modules/vite/dist/node/chunks/config.js:28801:14    
 ❯ loadAndTransform node_modules/vite/dist/node/chunks/config.js:22670:26

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯


 Test Files  5 failed (5)
      Tests  no tests
   Start at  01:05:23
   Duration  10.17s (transform 116ms, setup 5.57s, collect 0ms, tests 0ms, environment 29.91s, prepare 4.36s)

PS D:\ai-news-summarizer>


This is a good failure. It’s not your ETL logic yet, it’s your Vitest path resolution.

Vitest doesn’t currently know that @/ means src/, even though TypeScript does via tsconfig.json. So all the imports like @/lib/news/... fail before any tests run.

Add this to vitest.config.ts:

import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
Then rerun:

npx vitest run
If you want to narrow it while doing TDD, run just one file:

npx vitest run src/lib/news/__tests__/normalize-articles.test.ts
What should happen next:

the import-resolution errors should disappear
then you’ll get real behavior failures, which is what we want for TDD
If you still get errors after that, send me the new output and I’ll help you through the next RED step.


npx vitest run

 RUN  v3.2.4 D:/ai-news-summarizer

 ✓ src/lib/news/__tests__/select-top-stories.test.ts (1 test) 8ms
 ✓ src/lib/news/__tests__/summarize-articles.test.ts (1 test) 7ms
 ✓ src/lib/news/__tests__/normalize-articles.test.ts (3 tests) 21ms
 ❯ src/lib/news/__tests__/dedupe-articles.test.ts (3 tests | 2 failed) 45ms
   × dedupeArticles > keeps the higher-quality article when ids collide 31ms
     → expected 1 to be 4 // Object.is equality
   × dedupeArticles > deduplicates articles by canonical URL 9ms
     → expected 'Short version' to be 'Better version' // Object.is equality
   ✓ dedupeArticles > returns deduped articles sorted by published date descending 2ms
 ✓ src/lib/data/__tests__/load-articles.test.ts (1 test) 67ms

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/lib/news/__tests__/dedupe-articles.test.ts > dedupeArticles > keeps the higher-quality article when ids collide
AssertionError: expected 1 to be 4 // Object.is equality

- Expected
+ Received

- 4
+ 1

 ❯ src/lib/news/__tests__/dedupe-articles.test.ts:39:37
     37| 
     38|     expect(deduped).toHaveLength(1);
     39|     expect(deduped[0].qualityScore).toBe(4);
       |                                     ^
     40|   });
     41|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  src/lib/news/__tests__/dedupe-articles.test.ts > dedupeArticles > deduplicates articles by canonical URL
AssertionError: expected 'Short version' to be 'Better version' // Object.is equality

Expected: "Better version"
Received: "Short version"

 ❯ src/lib/news/__tests__/dedupe-articles.test.ts:68:36
     66|     expect(deduped).toHaveLength(1);
     67|     expect(deduped[0].canonicalUrl).toBe("https://example.com/story");
     68|     expect(deduped[0].description).toBe("Better version");
       |                                    ^
     69|   });
     70|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed | 4 passed (5)
      Tests  2 failed | 7 passed (9)
   Start at  01:06:41
   Duration  9.24s (transform 713ms, setup 5.05s, collect 2.24s, tests 148ms, environment 26.42s, prepare 4.35s)


Perfect TDD moment. The tests are doing their job: they found a real bug in dedupe-articles.ts.

What’s wrong
Your comparison function returns a positive number when the candidate article is better:

candidate.qualityScore - current.qualityScore
But your replacement check is reversed:

if (!existing || compareArticles(existing, article) < 0) {
  deduped.set(article.id, article);
}
That says “replace only when candidate is worse,” which is why the lower-quality/older version is being kept.

Minimal GREEN fix
Change the condition to > 0:

export function dedupeArticles(articles: NormalizedArticle[]): NormalizedArticle[] {
  const deduped = new Map<string, NormalizedArticle>();

  for (const article of articles) {
    const existing = deduped.get(article.id);

    if (!existing || compareArticles(existing, article) > 0) {
      deduped.set(article.id, article);
    }
  }

  return [...deduped.values()].sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
  );
}
Why this is the right TDD move

one failing behavior
one tiny code change
no refactor yet
directly satisfies the public behavior under test
Next command
Run just the failing file first:

npx vitest run src/lib/news/__tests__/dedupe-articles.test.ts
Then, if it passes, run the full suite:

npx vitest run
If you want, after that I can help you do the refactor step to make the comparison logic read more clearly.


PS D:\ai-news-summarizer> npx vitest run src/lib/news/__tests__/dedupe-articles.test.ts          
                                                            
 RUN  v3.2.4 D:/ai-news-summarizer

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Unhandled Errors ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

Vitest caught 1 unhandled error during the test run.
This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Unhandled Error ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Error: ENOSPC: no space left on device, write
 ❯ write node:internal/fs/promises:1386:8
 ❯ writeFileHandle node:internal/fs/promises:1143:7
 ❯ Proxy.fetch node_modules/vitest/dist/chunks/coverage.DL5VHqXY.js:2479:4
 ❯ EventEmitter.onMessage node_modules/vitest/dist/chunks/index.B521nVV-.js:103:20

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯


 Test Files   (1)
      Tests  no tests
     Errors  1 error
   Start at  13:18:26
   Duration  3.42s (transform 107ms, setup 0ms, collect 0ms, tests 0ms, environment 0ms, prepare 0ms)

PS D:\ai-news-summarizer>


This failure is not from your dedupe code anymore. Vitest is crashing because the machine is out of disk space: ENOSPC.

So the next blocker is environment, not test logic.

Try this cleanup first from the repo root:

Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force coverage -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
Then rerun just the one file:

npx vitest run src/lib/news/__tests__/dedupe-articles.test.ts
If disk space is still too tight, also check for large local junk in the repo:

Get-ChildItem -Force
Get-ChildItem -Recurse -Directory | Sort-Object FullName
Important takeaway:

previous failure = real TDD failure in dedupe logic
current failure = machine storage problem
no tests actually ran this time, so you still need one clean rerun after freeing space
If you want, I can help you make the cleanup safer by identifying exactly which generated folders in this repo are safe to delete.


PS D:\ai-news-summarizer> Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
PS D:\ai-news-summarizer> Remove-Item -Recurse -Force coverage -ErrorAction SilentlyContinue
PS D:\ai-news-summarizer> Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
PS D:\ai-news-summarizer> npx vitest run src/lib/news/__tests__/dedupe-articles.test.ts 
   
 RUN  v3.2.4 D:/ai-news-summarizer

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Unhandled Errors ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

Vitest caught 1 unhandled error during the test run.
This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Unhandled Error ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Error: ENOSPC: no space left on device, write
 ❯ write node:internal/fs/promises:1386:8
 ❯ writeFileHandle node:internal/fs/promises:1143:7
 ❯ Proxy.fetch node_modules/vitest/dist/chunks/coverage.DL5VHqXY.js:2479:4
 ❯ EventEmitter.onMessage node_modules/vitest/dist/chunks/index.B521nVV-.js:103:20

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯


 Test Files   (1)
      Tests  no tests
     Errors  1 error
   Start at  13:20:50
   Duration  1.91s (transform 105ms, setup 0ms, collect 0ms, tests 0ms, environment 0ms, prepare 0ms)

PS D:\ai-news-summarizer>


Vitest is still not reaching your tests. The machine is so low on space that Vitest is failing while trying to write its own runtime files.

Two useful moves:

Disable coverage explicitly for the run
npx vitest run --coverage.enabled=false src/lib/news/__tests__/dedupe-articles.test.ts
If that still fails, you need to free more disk space outside the repo. The current error is environmental, not from your test or code.
Important note:

no tests ran yet
your dedupe fix is still unverified
the next clean signal should come only after ENOSPC is gone
If coverage-off works, great. Then run:

npx vitest run --coverage.enabled=false
If it still fails, free space in one of these places first:

Downloads
Recycle Bin
large videos/zips
old node_modules folders in other projects
npm cache
You can also clear npm cache with:

npm cache clean --force
Best immediate next command:

npx vitest run --coverage.enabled=false src/lib/news/__tests__/dedupe-articles.test.ts
Send me that output and I’ll help with the next exact step.


PS D:\ai-news-summarizer> npx vitest run                                                         
     
 RUN  v3.2.4 D:/ai-news-summarizer

 ✓ src/lib/news/__tests__/summarize-articles.test.ts (1 test) 9ms
 ✓ src/lib/news/__tests__/select-top-stories.test.ts (1 test) 11ms
 ✓ src/lib/news/__tests__/dedupe-articles.test.ts (3 tests) 20ms
 ✓ src/lib/news/__tests__/normalize-articles.test.ts (3 tests) 22ms
 ✓ src/lib/data/__tests__/load-articles.test.ts (1 test) 68ms

 Test Files  5 passed (5)
      Tests  9 passed (9)
   Start at  13:33:48
   Duration  9.11s (transform 846ms, setup 4.62s, collect 2.53s, tests 130ms, environment 24.63s, prepare 3.25s)

PS D:\ai-news-summarizer>


Excellent. That’s a clean GREEN state.

You now have:

5 test files passing
9 tests passing
ETL behaviors covered for:
invalid article rejection
category normalization
deduplication by canonical URL
sorting by published date
top story selection
Most important TDD win here: the tests caught a real bug in dedupe-articles.ts, and you fixed it with a minimal change. That’s exactly the red-green loop working the way it should.

Best next step is refactor while green. I’d suggest one small cleanup:

rename compareArticles to something clearer like compareCandidateToExisting or scoreReplacement
or invert the function so the condition reads more naturally
For example, a nicer shape is:

function shouldReplace(
  existing: NormalizedArticle,
  candidate: NormalizedArticle,
): boolean {
  if (candidate.qualityScore !== existing.qualityScore) {
    return candidate.qualityScore > existing.qualityScore;
  }

  return (
    new Date(candidate.publishedAt).getTime() >
    new Date(existing.publishedAt).getTime()
  );
}
Then:

if (!existing || shouldReplace(existing, article)) {
  deduped.set(article.id, article);
}
That’s easier to read and less error-prone than numeric comparison.

If you want, I can help you with the next TDD cycle and suggest the next behavior to add, probably:

reject invalid published dates
reject invalid URLs
select top stories after dedupe and sort as one higher-level pipeline behavior

Improve Codebase Architecture Review this AI News Summarizer codebase architecture after the first working version.

Please suggest:
- better folder organization
- separation of ingestion, ETL, summarization, and UI concerns
- cleaner interfaces
- places where code is too tightly coupled
- before/after architecture notes I can include in my assignment




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


