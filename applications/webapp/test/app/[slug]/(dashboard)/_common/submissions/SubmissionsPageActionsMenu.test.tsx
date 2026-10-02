import { render, screen } from "@testing-library/react";

import { SubmissionsPageActionsMenu } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionsMenu";
import { SubmissionStatus } from "@/domain/enumerate/SubmissionStatus";
import { MockSubmissionWithCodeResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock("@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionDownload", () => ({
  SubmissionsPageActionDownload: () => <span data-testid="download-action">Download</span>,
}));
jest.mock("@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionJudge", () => ({
  SubmissionsPageActionJudge: () => <span data-testid="judge-action">Judge</span>,
}));
jest.mock("@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionResubmit", () => ({
  SubmissionsPageActionResubmit: () => <span data-testid="resubmit-action">Resubmit</span>,
}));

describe("SubmissionsPageActionsMenu", () => {
  it("offers download, resubmit, and judge actions for editable submissions", () => {
    render(<SubmissionsPageActionsMenu
      submission={MockSubmissionWithCodeResponseDTO()}
      canEdit
      onEdit={jest.fn()}
    />);
    expect(screen.getByTestId("submission-actions-button")).toBeInTheDocument();
    expect(screen.getAllByTestId("download-action").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("resubmit-action").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("judge-action").length).toBeGreaterThan(0);
  });

  it("omits resubmit while the submission is already judging", () => {
    render(<SubmissionsPageActionsMenu
      submission={MockSubmissionWithCodeResponseDTO({ status: SubmissionStatus.JUDGING })}
      canEdit
      onEdit={jest.fn()}
    />);
    expect(screen.queryByTestId("resubmit-action")).toBeNull();
    expect(screen.getAllByTestId("judge-action").length).toBeGreaterThan(0);
  });
});
