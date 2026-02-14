import { screen } from "@testing-library/dom";

import { SubmissionsPageActionsMenu } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-actions-menu";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockSubmissionFullResponseDTO } from "@/test/mock/response/submission/MockSubmissionFullResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionsPageActionsMenu", () => {
  it("should display download action only", async () => {
    const submission = MockSubmissionFullResponseDTO();
    const contestMetadata = MockContestMetadataResponseDTO();
    await renderWithProviders(
      <SubmissionsPageActionsMenu submission={submission} />,
      { contestMetadata },
    );

    expect(
      screen.queryByTestId("submission-actions-button"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("submissions-page-action-download"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("submissions-page-action-rerun"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("submissions-page-action-judge"),
    ).not.toBeInTheDocument();
  });

  it("should display all actions", async () => {
    const submission = MockSubmissionFullResponseDTO();
    const contestMetadata = MockContestMetadataResponseDTO();
    await renderWithProviders(
      <SubmissionsPageActionsMenu submission={submission} canEdit />,
      { contestMetadata },
    );

    expect(
      screen.queryByTestId("submission-actions-button"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("submissions-page-action-download"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("submissions-page-action-rerun"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("submissions-page-action-judge"),
    ).toBeInTheDocument();
  });
});
