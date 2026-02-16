import { fireEvent, screen } from "@testing-library/dom";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page";
import { MockDate } from "@/test/mock/mock-date";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";
import { MockSubmissionFullResponseDTO } from "@/test/mock/response/submission/MockSubmissionFullResponseDTO";
import { MockSubmissionPublicResponseDTO } from "@/test/mock/response/submission/MockSubmissionPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionsPage", () => {
  const contestMetadata = MockContestMetadataResponseDTO({
    startAt: MockDate.past().toISOString(),
    endAt: MockDate.future().toISOString(),
  });
  const problems = [
    MockProblemPublicResponseDTO(),
    MockProblemPublicResponseDTO(),
  ];

  describe("variant - cannot create or edit", () => {
    const submissions = [MockSubmissionPublicResponseDTO()];

    it("should render submissions table without actions", async () => {
      await renderWithProviders(
        <SubmissionsPage
          submissions={submissions}
          problems={problems}
          canCreate={false}
          canEdit={false}
        />,
        { contestMetadata },
      );

      expect(screen.queryByTestId("submission-form")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("open-create-form-button"),
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("only-mine-toggle")).not.toBeInTheDocument();

      expect(screen.getByTestId("submission-timestamp")).toHaveTextContent(
        "01/01/2025, 10:00:00 AM",
      );
      expect(screen.getByTestId("submission-member")).toHaveTextContent(
        submissions[0].member.name,
      );
      expect(screen.getByTestId("submission-problem")).toHaveTextContent(
        submissions[0].problem.letter,
      );
      expect(screen.getByTestId("submission-language")).toHaveTextContent(
        "C++ 17",
      );
      expect(screen.getByTestId("submission-status")).toHaveTextContent(
        "Judged",
      );
      expect(screen.getByTestId("submission-answer")).toHaveTextContent(
        "Accepted",
      );
      expect(
        screen.queryByTestId("submission-actions-button"),
      ).not.toBeInTheDocument();
    });
  });

  describe("variant - can create", () => {
    const submissions = [
      MockSubmissionPublicResponseDTO(),
      MockSubmissionPublicResponseDTO(),
    ];
    const memberSubmissions = [
      MockSubmissionFullResponseDTO({ id: submissions[0].id }),
    ];

    it("should render create form", async () => {
      await renderWithProviders(
        <SubmissionsPage
          submissions={submissions}
          memberSubmissions={memberSubmissions}
          problems={problems}
          canCreate
          onCreate={() => {}}
          canEdit={false}
        />,
        { contestMetadata },
      );

      expect(screen.queryByTestId("submission-form")).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId("open-create-form-button"));
      expect(screen.getByTestId("submission-form")).toBeInTheDocument();
    });

    it("should toggle only mine", async () => {
      await renderWithProviders(
        <SubmissionsPage
          submissions={submissions}
          memberSubmissions={memberSubmissions}
          problems={problems}
          canCreate={true}
          onCreate={() => {}}
          canEdit={false}
        />,
        { contestMetadata },
      );

      expect(screen.getAllByTestId("submission-member")).toHaveLength(2);
      fireEvent.click(screen.getByTestId("only-mine-toggle"));
      expect(screen.getAllByTestId("submission-member")).toHaveLength(1);
    });

    it("should not render create form when contest ended", async () => {
      const endedContestMetadata = MockContestMetadataResponseDTO({
        startAt: MockDate.past(2).toISOString(),
        endAt: MockDate.past().toISOString(),
      });

      await renderWithProviders(
        <SubmissionsPage
          submissions={submissions}
          memberSubmissions={memberSubmissions}
          problems={problems}
          canCreate
          onCreate={() => {}}
          canEdit={false}
        />,
        { contestMetadata: endedContestMetadata },
      );

      expect(
        screen.queryByTestId("open-create-form-button"),
      ).not.toBeInTheDocument();
    });
  });
});
