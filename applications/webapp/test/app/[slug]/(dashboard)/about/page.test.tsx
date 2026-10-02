import { render, screen } from "@testing-library/react";

import AboutPage from "@/app/[slug]/(dashboard)/about/page";
import { MockContestResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("AboutPage", () => {
  it("shows contest metadata and supported languages", async () => {
    await renderWithProviders(<AboutPage />, {
      contest: MockContestResponseDTO({ title: "Spring contest" }),
    });
    expect(screen.getByTestId("title")).toHaveTextContent("Spring contest");
    expect(screen.getByTestId("language-CPP_17")).toHaveTextContent("C++17");
  });
});
