import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { ClarificationFormMap } from "@/app/[slug]/(dashboard)/_common/_form/clarification-form-map";
import { ClarificationsPageCard } from "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page-card";
import { useToast } from "@/app/_lib/util/toast-hook";
import { clarificationWritter } from "@/config/composition";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ClarificationsPageCard", () => {
  describe("Cannot answer clarifications", () => {
    it("should render clarifications card without problem", async () => {
      const clarification = MockClarificationResponseDTO({
        problem: undefined,
      });
      await renderWithProviders(
        <ClarificationsPageCard
          clarification={clarification}
          contestId="test-contest"
          canAnswer={false}
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
      ).toHaveTextContent("01/01/2025, 10:00:00 AM");
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
      const clarification = MockClarificationResponseDTO();
      await renderWithProviders(
        <ClarificationsPageCard
          clarification={clarification}
          contestId="test-contest"
          canAnswer={false}
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
      ).toHaveTextContent("01/01/2025, 10:00:00 AM");
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
      const clarification = MockClarificationResponseDTO({
        children: [MockClarificationResponseDTO()],
      });
      await renderWithProviders(
        <ClarificationsPageCard
          clarification={clarification}
          contestId="test-contest"
          canAnswer={false}
        />,
      );

      expect(
        screen.getByTestId("clarification-answer-card"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("clarification-answer-card")).toHaveTextContent(
        clarification.children[0].text,
      );
      expect(
        screen.queryByTestId("clarification-answer-member-name"),
      ).toHaveTextContent(clarification.children[0].member.name);
    });
  });

  describe("Can answer clarifications", () => {
    it("should render answer form when canAnswer is true and clarification is unanswered", async () => {
      const clarification = MockClarificationResponseDTO({
        children: [],
      });
      await renderWithProviders(
        <ClarificationsPageCard
          clarification={clarification}
          contestId="test-contest"
          canAnswer={true}
        />,
      );

      expect(
        screen.getByTestId("clarification-answer-form"),
      ).toBeInTheDocument();
    });

    it("should not render answer form when canAnswer is true but clarification is already answered", async () => {
      const clarification = MockClarificationResponseDTO({
        children: [MockClarificationResponseDTO()],
      });
      await renderWithProviders(
        <ClarificationsPageCard
          clarification={clarification}
          contestId="test-contest"
          canAnswer={true}
        />,
      );

      expect(
        screen.queryByTestId("clarification-answer-form"),
      ).not.toBeInTheDocument();
    });

    it("should create answer when form is submitted", async () => {
      (clarificationWritter.create as jest.Mock).mockResolvedValueOnce(
        MockClarificationResponseDTO(),
      );
      const clarification = MockClarificationResponseDTO();
      await renderWithProviders(
        <ClarificationsPageCard
          clarification={clarification}
          contestId="test-contest"
          canAnswer
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

      expect(clarificationWritter.create).toHaveBeenCalledWith("test-contest", {
        ...ClarificationFormMap.toInputDTO({ text: "This is an answer" }),
        parentId: clarification.id,
      });
      expect(useToast().success).toHaveBeenCalled();
    });

    it("should show error toast when creating answer fails", async () => {
      (clarificationWritter.create as jest.Mock).mockRejectedValueOnce(
        new Error("Failed to create answer"),
      );
      const clarification = MockClarificationResponseDTO();
      await renderWithProviders(
        <ClarificationsPageCard
          clarification={clarification}
          contestId="test-contest"
          canAnswer
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

      expect(clarificationWritter.create).toHaveBeenCalledWith("test-contest", {
        ...ClarificationFormMap.toInputDTO({ text: "This is an answer" }),
        parentId: clarification.id,
      });
      expect(useToast().error).toHaveBeenCalled();
    });

    it("should render delete button and delete clarification when delete button is clicked", async () => {
      (clarificationWritter.deleteById as jest.Mock).mockResolvedValueOnce({});
      const clarification = MockClarificationResponseDTO();
      await renderWithProviders(
        <ClarificationsPageCard
          clarification={clarification}
          contestId="test-contest"
          canAnswer
        />,
      );

      expect(
        screen.getByTestId("clarification-delete-button"),
      ).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("clarification-delete-button"));
      await act(async () => {
        fireEvent.click(
          screen.getByTestId("clarification-delete-confirm-button"),
        );
      });

      expect(clarificationWritter.deleteById).toHaveBeenCalledWith(
        "test-contest",
        clarification.id,
      );
      expect(useToast().success).toHaveBeenCalled();
    });

    it("should show error toast when deleting clarification fails", async () => {
      (clarificationWritter.deleteById as jest.Mock).mockRejectedValueOnce(
        new Error("Failed to delete clarification"),
      );
      const clarification = MockClarificationResponseDTO();
      await renderWithProviders(
        <ClarificationsPageCard
          clarification={clarification}
          contestId="test-contest"
          canAnswer
        />,
      );

      expect(
        screen.getByTestId("clarification-delete-button"),
      ).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("clarification-delete-button"));
      await act(async () => {
        fireEvent.click(
          screen.getByTestId("clarification-delete-confirm-button"),
        );
      });

      expect(clarificationWritter.deleteById).toHaveBeenCalledWith(
        "test-contest",
        clarification.id,
      );
      expect(useToast().error).toHaveBeenCalled();
    });
  });
});
