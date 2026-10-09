import { render, screen } from "@testing-library/react";

import { SubmissionsPageActionsMenu } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionsMenu";
import { SubmissionStatus } from "@/domain/enumerate/SubmissionStatus";
import {
  MockSubmissionWithCodeAndExecutionResponseDTO,
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

jest.mock("@/app/_lib/component/shadcn/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu-content">{children}</div>
  ),
  DropdownMenuGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu-group">{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu-label">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu-trigger">{children}</div>
  ),
}));

describe("SubmissionsPageActionsMenu", () => {
  it("offers download, resubmit, and judge actions for editable submissions", async () => {
    await renderWithProviders(
      <SubmissionsPageActionsMenu
        submission={MockSubmissionWithCodeAndExecutionResponseDTO()}
        canEdit
        onEdit={jest.fn()}
      />,
    );
    expect(screen.getByTestId("submission-actions-button")).toBeInTheDocument();
    expect(screen.getAllByTestId("download-action").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("resubmit-action").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("judge-action").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("executions-action").length).toBeGreaterThan(
      0,
    );
  });

  it("omits resubmit while the submission is already judging", async () => {
    await renderWithProviders(
      <SubmissionsPageActionsMenu
        submission={MockSubmissionWithCodeResponseDTO({
          status: SubmissionStatus.JUDGING,
        })}
        canEdit
        onEdit={jest.fn()}
      />,
    );
    expect(screen.queryByTestId("resubmit-action")).toBeNull();
    expect(screen.getAllByTestId("judge-action").length).toBeGreaterThan(0);
  });
});
