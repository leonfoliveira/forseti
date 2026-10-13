import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { ClarificationAnswerForm } from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationAnswerForm";
import { ClarificationsPageCard } from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationsPageCard";
import { useToast } from "@/app/_lib/hook/useToast";
import { Composition } from "@/config/composition";
import { MockClarificationResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ClarificationsPageCard", () => {
  describe("Cannot answer clarifications", () => {
    it("should render clarifications card without problem", async () => {
      const clarification = MockClarificationResponseDTO({
        problem: undefined,
        answer: undefined,
      });
      await renderWithProviders(
        <ClarificationsPageCard
          clarification={clarification}
          contestId="test-contest"
        />,
      );

      expect(screen.getByTestId("clarification-member-name")).toHaveTextContent(
        clarification.member.name,
      );
      expect(
        screen.queryByTestId("clarification-delete-button"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("clarification-created-at"),
      ).not.toBeEmptyDOMElement();
      expect(screen.queryByTestId("clarification-text")).toHaveTextContent(
        clarification.text,
      );
      expect(
        screen.queryByTestId("clarification-answer-card"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("clarification-answer-form"),
      ).not.toBeInTheDocument();
    });

    it("should render clarifications card with problem", async () => {
      const clarification = MockClarificationResponseDTO({ answer: undefined });
      await renderWithProviders(
        <ClarificationsPageCard
          clarification={clarification}
          contestId="test-contest"
        />,
      );

      expect(screen.getByTestId("clarification-member-name")).toHaveTextContent(
        clarification.member.name,
      );
      expect(
        screen.queryByTestId("clarification-delete-button"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("clarification-created-at"),
      ).not.toBeEmptyDOMElement();
      expect(screen.queryByTestId("clarification-text")).toHaveTextContent(
        clarification.text,
      );
      expect(
        screen.queryByTestId("clarification-problem-title"),
      ).toHaveTextContent(clarification.problem!.letter);
      expect(
        screen.queryByTestId("clarification-answer-card"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("clarification-answer-form"),
      ).not.toBeInTheDocument();
    });

    it("should render answer if clarification is answered", async () => {
      const clarification = MockClarificationResponseDTO({});
      await renderWithProviders(
        <ClarificationsPageCard
          clarification={clarification}
          contestId="test-contest"
        />,
      );

      expect(
        screen.getByTestId("clarification-answer-card"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("clarification-answer-card")).toHaveTextContent(
        clarification.answer!.text,
      );
      expect(
        screen.queryByTestId("clarification-answer-member-name"),
      ).toHaveTextContent(clarification.answer!.member.name);
    });
  });

  describe("Can answer clarifications", () => {
    it("should render answer form when canAnswer is true and clarification is unanswered", async () => {
      const clarification = MockClarificationResponseDTO({
        answer: undefined,
      });
      await renderWithProviders(
        <ClarificationsPageCard
          clarification={clarification}
          contestId="test-contest"
          canAnswer
          onAnswer={() => {}}
        />,
      );

      expect(
        screen.getByTestId("clarification-answer-form"),
      ).toBeInTheDocument();
    });

    it("should not render answer form when canAnswer is true but clarification is already answered", async () => {
      const clarification = MockClarificationResponseDTO({});
      await renderWithProviders(
        <ClarificationsPageCard
          clarification={clarification}
          contestId="test-contest"
          canAnswer
          onAnswer={() => {}}
        />,
      );

      expect(
        screen.queryByTestId("clarification-answer-form"),
      ).not.toBeInTheDocument();
    });

    it("should create answer when form is submitted", async () => {
      const newClarification = MockClarificationResponseDTO({});
      (
        Composition.clarificationWritter.create as jest.Mock
      ).mockResolvedValueOnce(newClarification);
      const clarification = MockClarificationResponseDTO({ answer: undefined });
      const onAnswer = jest.fn();
      await renderWithProviders(
        <ClarificationsPageCard
          clarification={clarification}
          contestId="test-contest"
          canAnswer
          onAnswer={onAnswer}
        />,
      );

      expect(
        screen.getByTestId("clarification-answer-form"),
      ).toBeInTheDocument();
      fireEvent.change(screen.getByTestId("clarification-answer-textarea"), {
        target: { value: "This is an answer" },
      });
      await act(async () => {
        fireEvent.click(
          screen.getByTestId("clarification-answer-submit-button"),
        );
      });

      expect(Composition.clarificationWritter.create).toHaveBeenCalledWith(
        "test-contest",
        ClarificationAnswerForm.toInputDTO({
          text: "This is an answer",
        }),
      );
      expect(useToast().success).toHaveBeenCalled();
      expect(onAnswer).toHaveBeenCalledWith(newClarification);
    });

    it("should show error toast when creating answer fails", async () => {
      (
        Composition.clarificationWritter.create as jest.Mock
      ).mockRejectedValueOnce(new Error("Failed to create answer"));
      const clarification = MockClarificationResponseDTO({ answer: undefined });
      await renderWithProviders(
        <ClarificationsPageCard
          clarification={clarification}
          contestId="test-contest"
          canAnswer
          onAnswer={() => {}}
        />,
      );

      expect(
        screen.getByTestId("clarification-answer-form"),
      ).toBeInTheDocument();
      fireEvent.change(screen.getByTestId("clarification-answer-textarea"), {
        target: { value: "This is an answer" },
      });
      await act(async () => {
        fireEvent.click(
          screen.getByTestId("clarification-answer-submit-button"),
        );
      });

      expect(Composition.clarificationWritter.create).toHaveBeenCalledWith(
        "test-contest",
        ClarificationAnswerForm.toInputDTO({
          text: "This is an answer",
        }),
      );
      expect(useToast().error).toHaveBeenCalled();
    });
  });
});
