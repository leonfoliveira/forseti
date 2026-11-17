import React from "react";
import { fireEvent, screen } from "@testing-library/react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import {
  MockMemberResponseDTO,
  MockSessionResponseDTO,
  MockSubmissionWithCodeResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/hook/useContestStatusWatcher", () => ({
  useContestStatusWatcher: () => ContestStatus.IN_PROGRESS,
}));
jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageForm",
  () => ({
    SubmissionsPageForm: () => <div data-testid="create-form">Create form</div>,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionsMenu",
  () => ({
    SubmissionsPageActionsMenu: () => (
      <span data-testid="actions-menu">Actions</span>
    ),
  }),
);

describe("SubmissionsPage", () => {
  it("renders submissions table", async () => {
    const submissions = [MockSubmissionWithCodeResponseDTO()];

    await renderWithProviders(
      <SubmissionsPage
        submissions={submissions}
        memberSubmissions={[]}
        problems={[]}
        onCreate={jest.fn()}
      />,
      { session: MockSessionResponseDTO() },
    );

    expect(
      screen.getByTestId("submission-timestamp"),
    ).not.toBeEmptyDOMElement();
    expect(screen.getByTestId("submission-member")).toHaveTextContent(
      submissions[0].member.name,
    );
    expect(screen.getByTestId("submission-problem")).toHaveTextContent(
      submissions[0].problem.letter,
    );
    expect(screen.getByTestId("submission-language")).toHaveTextContent(
      "C++ 17",
    );
    expect(screen.getByTestId("submission-status")).toHaveTextContent("Judged");
    expect(screen.getByTestId("submission-answer")).toHaveTextContent(
      "Accepted",
    );
  });

  it("filters only the submissions of the current member", async () => {
    const session = MockSessionResponseDTO();
    const memberSubmissions = [
      MockSubmissionWithCodeResponseDTO({
        member: MockMemberResponseDTO({ id: session.member.id }),
      }),
    ];
    const submissions = [
      MockSubmissionWithCodeResponseDTO(),
      memberSubmissions[0],
    ];

    await renderWithProviders(
      <SubmissionsPage
        submissions={submissions}
        memberSubmissions={memberSubmissions}
        problems={[]}
        onCreate={jest.fn()}
      />,
      { session },
    );

    expect(screen.getAllByTestId("submission-row").length).toBe(2);

    fireEvent.click(screen.getByTestId("only-mine-toggle"));

    expect(screen.getAllByTestId("submission-row").length).toBe(1);
  });

  it("renders create form", async () => {
    await renderWithProviders(
      <SubmissionsPage
        submissions={[]}
        memberSubmissions={[]}
        problems={[]}
        onCreate={jest.fn()}
      />,
      { session: MockSessionResponseDTO() },
    );

    fireEvent.click(screen.getByTestId("open-create-form-button"));

    expect(screen.getByTestId("create-form")).toBeInTheDocument();
  });

  it("renders actions menu", async () => {
    const submissions = [MockSubmissionWithCodeResponseDTO()];

    await renderWithProviders(
      <SubmissionsPage
        submissions={submissions}
        memberSubmissions={[]}
        problems={[]}
        canDownloadAny
        canViewExecutions
        onEdit={jest.fn()}
        onCreatePrintRequest={jest.fn()}
      />,
      { session: MockSessionResponseDTO() },
    );

    expect(screen.getByTestId("actions-menu")).toBeInTheDocument();
  });
});
