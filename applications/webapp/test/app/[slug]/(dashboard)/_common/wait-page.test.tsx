import { screen } from "@testing-library/dom";

import { WaitPage } from "@/app/[slug]/(dashboard)/_common/wait-page";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("WaitPage", () => {
  it("should render call components correctly", async () => {
    const contestMetadata = MockContestMetadataResponseDTO({
      startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    });
    await renderWithProviders(<WaitPage />, { contestMetadata });

    expect(screen.getByTestId("title")).toHaveTextContent(
      contestMetadata.title,
    );
    expect(screen.getByTestId("description")).toHaveTextContent("Starts in");
    expect(screen.getByTestId("clock")).toHaveTextContent("01:00:00");
    expect(screen.getByTestId("languages")).toHaveTextContent(
      "Supported languages",
    );
    const languageItems = screen.getAllByTestId("language-item");
    expect(languageItems).toHaveLength(2);
    expect(languageItems[0]).toHaveTextContent("C++ 17");
    expect(languageItems[1]).toHaveTextContent("Java 21");
  });
});
