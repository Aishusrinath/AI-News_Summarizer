import { render, screen } from "@testing-library/react";

import { ArticleList } from "@/components/article-list";

describe("ArticleList", () => {
  it("uses contextual empty copy for active filters", () => {
    render(
      <ArticleList
        articles={[]}
        emptyStateDescription="No India stories matched this snapshot yet. Try All regions or wait for the next refresh."
      />,
    );

    expect(
      screen.getByText(
        "No India stories matched this snapshot yet. Try All regions or wait for the next refresh.",
      ),
    ).toBeInTheDocument();
  });
});
