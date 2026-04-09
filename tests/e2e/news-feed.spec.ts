import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

test("users can filter headlines and open an article detail page", async ({ page }) => {
  const dataset = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data/processed/articles.json"), "utf8"),
  ) as {
    articles: Array<{ category: string; slug: string; title: string }>;
  };
  const technologyArticle = dataset.articles.find((article) => article.category === "technology");

  expect(technologyArticle).toBeTruthy();

  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Browse recent headlines with honest, excerpt-grounded summaries.",
    }),
  ).toBeVisible();

  await page
    .getByRole("navigation", { name: "Article categories" })
    .getByRole("link", { name: "Technology", exact: true })
    .click();

  await expect(page).toHaveURL(/category=technology/);
  await expect(
    page.getByRole("heading", { name: "Recent headlines", exact: true }),
  ).toBeVisible();

  await page.goto(`/articles/${technologyArticle!.slug}`);

  await expect(page).toHaveURL(/\/articles\//);
  await expect(page.getByRole("link", { name: "Back to headlines" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: technologyArticle!.title, exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Read original article" })).toBeVisible();
});
