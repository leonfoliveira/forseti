import { render, screen } from "@testing-library/react";

import { Page } from "@/app/_lib/component/page/Page";

describe("Page", () => {
  it("sets page metadata and renders its children", () => {
    render(<Page title="Page title" description="Page summary">
      <main data-testid="page-child">Content</main>
    </Page>);
    expect(document.querySelector("title")).toHaveTextContent("Page title");
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute("content", "Page summary");
    expect(screen.getByTestId("page-child")).toBeInTheDocument();
  });
});
