import { fireEvent, screen } from "@testing-library/react";

import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/ProblemsPage";
import { Composition } from "@/config/composition";
import { MockContestResponseDTO, MockProblemWithTestCasesResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ProblemsPage", () => {
  it("renders problems and offers test case downloads when permitted", async () => {
    await renderWithProviders(<ProblemsPage problems={[MockProblemWithTestCasesResponseDTO()]} canDownloadTestCases />, {
      contest: MockContestResponseDTO(),
    });
    expect(screen.getByTestId("problem-title")).toHaveTextContent("First problem");
    expect(screen.getByTestId("problem-download-test-cases")).toBeInTheDocument();
    jest.mocked(Composition.attachmentReader.download).mockResolvedValue(new File(["cases"], "cases.csv"));
    fireEvent.click(screen.getByTestId("problem-download-test-cases"));
    expect(Composition.attachmentReader.download).toHaveBeenCalled();
  });
});
