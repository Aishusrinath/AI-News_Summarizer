import { getArticleDetail } from "@/lib/data/get-article-detail";

describe("getArticleDetail", () => {
  it("returns the selected article with related stories from the same category", async () => {
    const detail = await getArticleDetail(
      "iran-truce-spurs-bull-turn-how-aggressive-should-you-be-inve-be4140ce",
    );

    expect(detail).not.toBeNull();
    expect(detail?.article.id).toBe("be4140ce9b9d4a3f");
    expect(detail?.relatedStories.every((story) => story.slug !== detail.article.slug)).toBe(
      true,
    );
    expect(
      detail?.relatedStories.every((story) => story.category === detail.article.category),
    ).toBe(true);
  });
});
