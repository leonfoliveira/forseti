import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { ClarificationsPageForm } from "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page-form";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { clarificationWritter } from "@/config/composition";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ClarificationsPageForm", () => {
  const problems = [MockProblemPublicResponseDTO()];

  it("should render form fields and submit button", async () => {
    const onClose = jest.fn();
    await renderWithProviders(
      <ClarificationsPageForm
        contestId="test-contest"
        onClose={onClose}
        onCreate={() => {}}
        problems={problems}
      />,
    );

    expect(screen.getByTestId("clarification-form")).toBeInTheDocument();
    expect(screen.getByTestId("clarification-form-text")).toBeInTheDocument();
    expect(screen.getByTestId("clarification-form-cancel")).toBeInTheDocument();
    expect(screen.getByTestId("clarification-form-submit")).toBeInTheDocument();
  });

  it("should call onClose when cancel button is clicked", async () => {
    const onClose = jest.fn();
    await renderWithProviders(
      <ClarificationsPageForm
        contestId="test-contest"
        onClose={onClose}
        onCreate={() => {}}
        problems={problems}
      />,
    );

    fireEvent.click(screen.getByTestId("clarification-form-cancel"));
    expect(onClose).toHaveBeenCalled();
  });

  it("should create clarification when submit button is clicked", async () => {
    const newClarification = MockClarificationResponseDTO();
    (clarificationWritter.create as jest.Mock).mockResolvedValueOnce(
      newClarification,
    );

    const onClose = jest.fn();
    const onCreate = jest.fn();
    await renderWithProviders(
      <ClarificationsPageForm
        contestId="test-contest"
        onClose={onClose}
        onCreate={onCreate}
        problems={problems}
      />,
    );

    fireEvent.change(screen.getByTestId("clarification-form-text"), {
      target: { value: "Test clarification" },
    });
    fireEvent.change(screen.getByTestId("clarification-form-problem"), {
      target: { value: "__none__" },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("clarification-form-submit"));
    });

    expect(clarificationWritter.create).toHaveBeenCalledWith("test-contest", {
      text: "Test clarification",
      problemId: undefined,
    });
    expect(useToast().success).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
    expect(onCreate).toHaveBeenCalledWith(newClarification);
  });

  it("should show error toast when clarification creation fails", async () => {
    (clarificationWritter.create as jest.Mock).mockRejectedValueOnce(
      new Error("Creation failed"),
    );

    const onClose = jest.fn();
    await renderWithProviders(
      <ClarificationsPageForm
        contestId="test-contest"
        onClose={onClose}
        problems={problems}
        onCreate={() => {}}
      />,
    );

    fireEvent.change(screen.getByTestId("clarification-form-text"), {
      target: { value: "Test clarification" },
    });
    fireEvent.change(screen.getByTestId("clarification-form-problem"), {
      target: { value: "__none__" },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("clarification-form-submit"));
    });

    expect(clarificationWritter.create).toHaveBeenCalledWith("test-contest", {
      text: "Test clarification",
      problemId: undefined,
    });
    expect(useToast().error).toHaveBeenCalled();
  });
});
