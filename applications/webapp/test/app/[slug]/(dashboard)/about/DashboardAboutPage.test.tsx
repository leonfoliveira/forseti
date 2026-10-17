import { screen } from "@testing-library/react";

import { DashboardAboutPage } from "@/app/[slug]/(dashboard)/about/DashboardAboutPage";
import { MockContestResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("DashboardAboutPage", () => {
  it("shows contest metadata and supported languages", async () => {
    await renderWithProviders(<DashboardAboutPage />, {
      contest: MockContestResponseDTO({ title: "Spring contest" }),
    });
    expect(screen.getByTestId("title")).toHaveTextContent("Spring contest");
    expect(screen.getByTestId("language-CPP_17")).toHaveTextContent("C++17");
  });
});
