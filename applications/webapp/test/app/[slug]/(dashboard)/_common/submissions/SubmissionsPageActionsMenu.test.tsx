import { screen } from "@testing-library/react";

import { SubmissionsPageActionsMenu } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionsMenu";
import { SubmissionStatus } from "@/domain/enumerate/SubmissionStatus";
import {
  MockContestWithMembersAndProblemsDTO,
  MockSubmissionWithCodeAndExecutionsResponseDTO,
  MockSubmissionWithCodeResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionDownload",
  () => ({
    SubmissionsPageActionDownload: () => (
      <span data-testid="download-action">Download</span>
    ),
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionJudge",
  () => ({
    SubmissionsPageActionJudge: () => (
      <span data-testid="judge-action">Judge</span>
    ),
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionExecutions",
  () => ({
    SubmissionsPageActionExecutions: () => (
      <span data-testid="executions-action">Executions</span>
    ),
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionResubmit",
  () => ({
    SubmissionsPageActionResubmit: () => (
      <span data-testid="resubmit-action">Resubmit</span>
    ),
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionCreatePrintRequest",
  () => ({
    SubmissionsPageActionCreatePrintRequest: () => (
      <span data-testid="create-print-request-action">
        Create Print Request
      </span>
    ),
  }),
);

describe("SubmissionsPageActionsMenu", () => {
  it("shows action download when can download any", async () => {
    await renderWithProviders(
      <SubmissionsPageActionsMenu
        submission={MockSubmissionWithCodeAndExecutionsResponseDTO()}
        canDownloadAny
      />,
    );

    expect(screen.getByTestId("download-action")).toBeInTheDocument();
  });

  it("shows action download when submission has code", async () => {
    await renderWithProviders(
      <SubmissionsPageActionsMenu
        submission={MockSubmissionWithCodeResponseDTO()}
      />,
    );

    expect(screen.getByTestId("download-action")).toBeInTheDocument();
  });

  it("shows executions when can view executions", async () => {
    const submission = MockSubmissionWithCodeAndExecutionsResponseDTO();
    await renderWithProviders(
      <SubmissionsPageActionsMenu submission={submission} canViewExecutions />,
    );

    expect(screen.getByTestId("executions-action")).toBeInTheDocument();
  });

  it("shows resubmit when can edit, autojudge is enabled and submission is not judging", async () => {
    const contest = MockContestWithMembersAndProblemsDTO({
      settings: {
        ...MockContestWithMembersAndProblemsDTO().settings,
        isAutoJudgeEnabled: true,
      },
    });
    const submission = MockSubmissionWithCodeAndExecutionsResponseDTO({
      status: SubmissionStatus.FAILED,
    });
    await renderWithProviders(
      <SubmissionsPageActionsMenu submission={submission} onEdit={jest.fn()} />,
      { contest },
    );

    expect(screen.getByTestId("resubmit-action")).toBeInTheDocument();
  });

  it("shows judge action when can edit", async () => {
    const submission = MockSubmissionWithCodeAndExecutionsResponseDTO();
    await renderWithProviders(
      <SubmissionsPageActionsMenu submission={submission} onEdit={jest.fn()} />,
    );

    expect(screen.getByTestId("judge-action")).toBeInTheDocument();
  });

  it("shows create print request when can create print request and it is enabled", async () => {
    const contest = MockContestWithMembersAndProblemsDTO({
      settings: {
        ...MockContestWithMembersAndProblemsDTO().settings,
        isPrintRequestEnabled: true,
      },
    });
    const submission = MockSubmissionWithCodeAndExecutionsResponseDTO();
    await renderWithProviders(
      <SubmissionsPageActionsMenu
        submission={submission}
        onCreatePrintRequest={jest.fn()}
      />,
      { contest },
    );

    expect(
      screen.getByTestId("create-print-request-action"),
    ).toBeInTheDocument();
  });
});
