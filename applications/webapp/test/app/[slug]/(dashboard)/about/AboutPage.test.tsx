import { screen } from "@testing-library/react";

import AboutPage from "@/app/[slug]/(dashboard)/about/AboutPage";
import { MockContestResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("AboutPage", () => {
  it("shows contest metadata and supported languages", async () => {
    await renderWithProviders(<AboutPage />, {
      contest: MockContestResponseDTO({
        title: "Spring contest",
        settings: {
          ...MockContestResponseDTO().settings,
          isAutoJudgeEnabled: false,
        },
      }),
    });

    expect(screen.getByTestId("title")).toHaveTextContent("Spring contest");
    expect(screen.getByTestId("language-CPP_17")).toHaveTextContent("C++ 17");
    expect(screen.getByTestId("auto-judge-disabled")).toBeInTheDocument();
    expect(screen.getByTestId("clarification-enabled")).toBeInTheDocument();
    expect(
      screen.getByTestId("submission-print-ticket-enabled"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("spectator-enabled")).toBeInTheDocument();
  });
});
