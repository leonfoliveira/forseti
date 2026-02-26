import { screen } from "@testing-library/dom";

import { SubmissionsPageActionsMenu } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-actions-menu";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { MemberWithLoginResponseDTO } from "@/core/port/dto/response/member/MemberWithLoginResponseDTO";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockSession } from "@/test/mock/response/session/MockSession";
import { MockSubmissionWithCodeAndExecutionsResponseDTO } from "@/test/mock/response/submission/MockSubmissionWithCodeAndExecutionsResponseDTO";
import { MockSubmissionWithCodeResponseDTO } from "@/test/mock/response/submission/MockSubmissionWithCodeResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionsPageActionsMenu", () => {
  it("should display download action only", async () => {
    const submission = MockSubmissionWithCodeResponseDTO();
    const contest = MockContestResponseDTO();
    await renderWithProviders(
      <SubmissionsPageActionsMenu submission={submission} />,
      { contest },
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
    const submission = MockSubmissionWithCodeAndExecutionsResponseDTO();
    const contest = MockContestResponseDTO();
    await renderWithProviders(
      <SubmissionsPageActionsMenu
        submission={submission}
        canViewExecutions
        canEdit
        onEdit={() => {}}
      />,
      { contest },
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
    const submission = MockSubmissionWithCodeAndExecutionsResponseDTO({
      status: SubmissionStatus.JUDGING,
    });
    const contest = MockContestResponseDTO();
    await renderWithProviders(
      <SubmissionsPageActionsMenu
        submission={submission}
        canEdit
        onEdit={() => {}}
      />,
      { contest },
    );

    expect(
      screen.queryByTestId("submissions-page-action-rerun"),
    ).not.toBeInTheDocument();
  });

  it("should display print action only for submission owner", async () => {
    const session = MockSession();
    const submission = MockSubmissionWithCodeResponseDTO({
      member: session.member as unknown as MemberWithLoginResponseDTO,
    });
    const contest = MockContestResponseDTO();
    await renderWithProviders(
      <SubmissionsPageActionsMenu
        submission={submission}
        canPrint
        onPrint={() => {}}
      />,
      { session, contest },
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
