import { screen } from "@testing-library/react";

import NotFoundPage from "@/app/error/NotFoundPage";
import { renderWithProviders } from "@/test/render-with-providers";

describe("NotFoundPage", () => {
  it("shows the not-found status and explanation", async () => {
    await renderWithProviders(<NotFoundPage />);

    expect(screen.getByTestId("code")).toHaveTextContent("404");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "The page you are looking for does not exist.",
    );
  });
});
