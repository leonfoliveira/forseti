import { screen } from "@testing-library/dom";

import { SubmissionsPageActionsMenu } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-actions-menu";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { MemberFullResponseDTO } from "@/core/port/dto/response/member/MemberFullResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockSession } from "@/test/mock/response/session/MockSession";
import { MockSubmissionFullResponseDTO } from "@/test/mock/response/submission/MockSubmissionFullResponseDTO";
import { MockSubmissionFullWithExecutionResponseDTO } from "@/test/mock/response/submission/MockSubmissionFullWithExecutionResponseDTO";
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
      screen.queryByTestId("submissions-page-action-executions"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("submissions-page-action-rerun"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("submissions-page-action-judge"),
    ).not.toBeInTheDocument();
  });

  it("should display all actions", async () => {
    const submission = MockSubmissionFullWithExecutionResponseDTO();
    const contestMetadata = MockContestMetadataResponseDTO();
    await renderWithProviders(
      <SubmissionsPageActionsMenu
        submission={submission}
        canEdit
        onEdit={() => {}}
      />,
      { contestMetadata },
    );

    expect(
      screen.queryByTestId("submission-actions-button"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("submissions-page-action-download"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("submissions-page-action-executions"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("submissions-page-action-rerun"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("submissions-page-action-judge"),
    ).toBeInTheDocument();
  });

  it("should not display rerun action when submission is judging", async () => {
    const submission = MockSubmissionFullWithExecutionResponseDTO({
      status: SubmissionStatus.JUDGING,
    });
    const contestMetadata = MockContestMetadataResponseDTO();
    await renderWithProviders(
      <SubmissionsPageActionsMenu
        submission={submission}
        canEdit
        onEdit={() => {}}
      />,
      { contestMetadata },
    );

    expect(
      screen.queryByTestId("submissions-page-action-rerun"),
    ).not.toBeInTheDocument();
  });

  it("should display print action only for submission owner", async () => {
    const session = MockSession();
    const submission = MockSubmissionFullResponseDTO({
      member: session.member as unknown as MemberFullResponseDTO,
    });
    const contestMetadata = MockContestMetadataResponseDTO();
    await renderWithProviders(
      <SubmissionsPageActionsMenu
        submission={submission}
        canPrint
        onPrint={() => {}}
      />,
      { session, contestMetadata },
    );

    expect(
      screen.queryByTestId("submission-actions-button"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("submissions-page-action-download"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("submissions-page-action-print"),
    ).toBeInTheDocument();
  });
});
