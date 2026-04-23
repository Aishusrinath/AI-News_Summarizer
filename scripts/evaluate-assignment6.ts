import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { answerNewsQuestion } from "@/lib/chat/news-answer";
import { retrieveNewsContext } from "@/lib/chat/retrieve-news-context";
import type { ChatResponse } from "@/lib/chat/types";
import type { ProcessedArticle, ProcessedDataset } from "@/lib/news/contracts/processed-schema";

type EvaluationCase = {
  id: string;
  kind: "representative" | "failure";
  message: string;
  expectedCategory?: string;
  expectedTitleIncludes?: string[];
  expectedGroundingStatus?: ChatResponse["groundingStatus"];
  metricReason: string;
};

type CaseResult = {
  id: string;
  kind: EvaluationCase["kind"];
  message: string;
  metricReason: string;
  expected: {
    category?: string;
    titleIncludes?: string[];
    groundingStatus?: ChatResponse["groundingStatus"];
  };
  improved: {
    groundingStatus: ChatResponse["groundingStatus"];
    sourceTitles: string[];
    retrievalHit: boolean | null;
    endToEndPass: boolean;
  };
  baseline: {
    sourceTitles: string[];
    retrievalHit: boolean | null;
    endToEndPass: boolean;
  };
};

const datasetPath = path.join(process.cwd(), "data", "processed", "articles.json");
const casesPath = path.join(process.cwd(), "data", "evaluation", "cases.json");
const outputPath = path.join(process.cwd(), "data", "evaluation", "results.json");

const dataset = JSON.parse(readFileSync(datasetPath, "utf8")) as ProcessedDataset;
const evaluationCases = JSON.parse(readFileSync(casesPath, "utf8")) as EvaluationCase[];

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "what",
  "when",
  "where",
  "who",
  "why",
  "with",
]);

function getBaselineTokens(message: string) {
  return message
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function baselineRetrieve(message: string, articles: ProcessedArticle[]) {
  const tokens = getBaselineTokens(message);
  const ranked = articles
    .map((article) => {
      const text = [
        article.title,
        article.summary,
        article.description,
        article.cleanedText,
        article.sourceName,
        article.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const ageHours = Math.max(
        0,
        (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60),
      );

      let score = Math.max(0, 48 - ageHours);

      for (const token of tokens) {
        if (text.includes(token)) {
          score += article.title.toLowerCase().includes(token) ? 8 : 4;
        }
      }

      if (article.summaryType === "ai") {
        score += 3;
      }

      return { article, score };
    })
    .sort((left, right) => right.score - left.score);

  const matches = ranked
    .filter((entry) => entry.score > 0)
    .slice(0, 4)
    .map((entry) => entry.article);

  return matches.length > 0 ? matches : articles.slice(0, 3);
}

function sourceTitles(response: ChatResponse) {
  return response.sources.map((source) => source.title);
}

function hasExpectedHit(titles: string[], testCase: EvaluationCase) {
  if (testCase.expectedTitleIncludes) {
    return testCase.expectedTitleIncludes.some((expected) =>
      titles.some((title) => title.toLowerCase().includes(expected.toLowerCase())),
    );
  }

  if (testCase.expectedCategory) {
    return titles.some((title) => {
      const article = dataset.articles.find((candidate) => candidate.title === title);
      return article?.category === testCase.expectedCategory;
    });
  }

  return null;
}

function passesEndToEnd(response: ChatResponse, titles: string[], testCase: EvaluationCase) {
  if (testCase.expectedGroundingStatus) {
    return response.groundingStatus === testCase.expectedGroundingStatus;
  }

  const hit = hasExpectedHit(titles, testCase);

  return response.groundingStatus === "grounded" && hit === true;
}

const caseResults: CaseResult[] = evaluationCases.map((testCase) => {
  const response = answerNewsQuestion({
    message: testCase.message,
    currentDataset: dataset,
    previousDataset: null,
    routingReason: "Evaluation routed to News Model.",
  });
  const improvedTitles = sourceTitles(response);
  const baselineTitles = baselineRetrieve(testCase.message, dataset.articles).map(
    (article) => article.title,
  );
  const baselineGroundingStatus =
    baselineTitles.length > 0 ? ("grounded" as const) : ("insufficient" as const);

  return {
    id: testCase.id,
    kind: testCase.kind,
    message: testCase.message,
    metricReason: testCase.metricReason,
    expected: {
      category: testCase.expectedCategory,
      titleIncludes: testCase.expectedTitleIncludes,
      groundingStatus: testCase.expectedGroundingStatus,
    },
    improved: {
      groundingStatus: response.groundingStatus,
      sourceTitles: improvedTitles,
      retrievalHit: hasExpectedHit(improvedTitles, testCase),
      endToEndPass: passesEndToEnd(response, improvedTitles, testCase),
    },
    baseline: {
      sourceTitles: baselineTitles,
      retrievalHit: hasExpectedHit(baselineTitles, testCase),
      endToEndPass:
        testCase.expectedGroundingStatus === undefined
          ? hasExpectedHit(baselineTitles, testCase) === true
          : baselineGroundingStatus === testCase.expectedGroundingStatus,
    },
  };
});

const representativeCases = caseResults.filter((result) => result.kind === "representative");
const failureCases = caseResults.filter((result) => result.kind === "failure");
const retrievalCases = caseResults.filter((result) => result.improved.retrievalHit !== null);

const normalizedCount = dataset.counts.normalized;
const upstreamPass =
  dataset.counts.finalArticles === dataset.articles.length &&
  dataset.counts.deduped >= dataset.counts.finalArticles &&
  normalizedCount >= dataset.counts.finalArticles;

const report = {
  generatedAt: new Date().toISOString(),
  dataset: {
    source: dataset.source,
    generatedAt: dataset.generatedAt,
    articleCount: dataset.articles.length,
    counts: dataset.counts,
  },
  metrics: {
    outputQuality: {
      metric: "source hit rate on representative grounded cases",
      improved: `${representativeCases.filter((result) => result.improved.endToEndPass).length}/${representativeCases.length}`,
      baseline: `${representativeCases.filter((result) => result.baseline.endToEndPass).length}/${representativeCases.length}`,
    },
    endToEndTaskSuccess: {
      metric: "expected grounding status plus expected source when applicable",
      improved: `${caseResults.filter((result) => result.improved.endToEndPass).length}/${caseResults.length}`,
      baseline: `${caseResults.filter((result) => result.baseline.endToEndPass).length}/${caseResults.length}`,
    },
    upstreamRetrieval: {
      metric: "hit@4 for cases with expected source/category",
      improved: `${retrievalCases.filter((result) => result.improved.retrievalHit).length}/${retrievalCases.length}`,
      baseline: `${retrievalCases.filter((result) => result.baseline.retrievalHit).length}/${retrievalCases.length}`,
    },
    upstreamTransformation: {
      metric: "processed artifact count consistency",
      passed: upstreamPass,
      detail:
        "finalArticles must equal the stored article array length and be no larger than normalized/deduped counts.",
    },
  },
  cases: caseResults,
};

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(`Assignment 6 evaluation written to ${outputPath}`);
console.log(JSON.stringify(report.metrics, null, 2));
