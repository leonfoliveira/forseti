import { render, screen } from "@testing-library/react";

import { Page } from "@/app/_lib/component/page/Page";
import { renderWithProviders } from "@/test/render-with-providers";

describe("Page", () => {
  it("sets page metadata and renders its children", async () => {
    await renderWithProviders(
      <Page title="brand" description="brand">
        <main data-testid="page-child">Content</main>
      </Page>,
    );

    expect(document.querySelector("title")).toHaveTextContent("Forseti");
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      "content",
      "Forseti",
    );
    expect(screen.getByTestId("page-child")).toBeInTheDocument();
  });
});
