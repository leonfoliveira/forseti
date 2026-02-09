import { screen } from "@testing-library/dom";

import { Page } from "@/app/_lib/component/page/page";
import { renderWithProviders } from "@/test/render-with-providers";

describe("Page", () => {
  it("should render title and description in metadata", async () => {
    const title = {
      id: "test-page.title",
      defaultMessage: "Test Page",
    };
    const description = {
      id: "test-page.description",
      defaultMessage: "This is a test page.",
    };

    await renderWithProviders(
      <Page title={title} description={description}>
        <span data-testid="child" />
      </Page>,
    );

    expect(document.title).toBe("test-page.title");
    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription).toBeInTheDocument();
    expect(metaDescription?.getAttribute("content")).toBe(
      "test-page.description",
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
