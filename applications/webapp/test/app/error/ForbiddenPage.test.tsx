import { screen } from "@testing-library/react";

import ForbiddenPage from "@/app/error/ForbiddenPage";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ForbiddenPage", () => {
  it("shows the forbidden status and explanation", async () => {
    await renderWithProviders(<ForbiddenPage />);

    expect(screen.getByTestId("code")).toHaveTextContent("403");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "You do not have permission to access this page.",
    );
  });
});
