import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { act } from "react";
import { v4 as uuidv4 } from "uuid";

import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications-page";
import { clarificationService } from "@/config/composition";
import { useToast } from "@/lib/util/toast-hook";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ClarificationsPage", () => {
  const contestId = uuidv4();
  const problems = [
    MockProblemPublicResponseDTO(),
    MockProblemPublicResponseDTO(),
  ];
  const clarifications = [
    MockClarificationResponseDTO(),
    MockClarificationResponseDTO({
      problem: undefined,
      children: [MockClarificationResponseDTO()],
    }),
  ];

  it("should render variant with no clarification", async () => {
    await renderWithProviders(
      <ClarificationsPage
        contestId={contestId}
        problems={problems}
        clarifications={[]}
      />,
    );

    expect(document.title).toBe("Forseti - Clarifications");
    expect(screen.queryByTestId("empty")).toBeInTheDocument();
    expect(screen.queryByTestId("clarification")).not.toBeInTheDocument();
  });

  it("should render variant with clarifications", async () => {
    await renderWithProviders(
      <ClarificationsPage
        contestId={contestId}
        problems={problems}
        clarifications={clarifications}
      />,
    );

    expect(document.title).toBe("Forseti - Clarifications");
    expect(screen.queryByTestId("empty")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("clarification")).toHaveLength(2);
    expect(
      screen.getAllByTestId("clarification-member-name")[0],
    ).toHaveTextContent(clarifications[1].member.name);
    expect(screen.getAllByTestId("clarification-problem")[0]).toHaveTextContent(
      "General",
    );
    expect(screen.getAllByTestId("clarification-problem")[1]).toHaveTextContent(
      "Problem A",
    );
    expect(
      screen.getAllByTestId("clarification-created-at")[0],
    ).toHaveTextContent("01/01/2025, 10:00:00 AM");
    expect(screen.getAllByTestId("clarification-text")[0]).toHaveTextContent(
      clarifications[1].text,
    );
    expect(screen.getByTestId("answer-member-name")).toHaveTextContent(
      clarifications[1].children[0].member.name,
    );
    expect(screen.getByTestId("answer-created-at")).toHaveTextContent(
      "01/01/2025, 10:00:00 AM",
    );
    expect(screen.getByTestId("answer-text")).toHaveTextContent(
      clarifications[1].children[0].text,
    );
  });

  it("should render variant with create", async () => {
    await renderWithProviders(
      <ClarificationsPage
        contestId={contestId}
        problems={problems}
        clarifications={clarifications}
        canCreate
      />,
    );

    expect(screen.getByTestId("create-form")).toBeInTheDocument();
    expect(screen.getByTestId("create-form-title")).toHaveTextContent(
      "Create Clarification",
    );
    expect(screen.getByTestId("create-form-problem")).toBeEnabled();
    expect(screen.getByTestId("create-form-text")).toBeEnabled();
    expect(screen.getByTestId("create-form-submit")).toBeEnabled();
  });

  it("should render variant with answer", async () => {
    await renderWithProviders(
      <ClarificationsPage
        contestId={contestId}
        problems={problems}
        clarifications={clarifications}
        canAnswer
      />,
    );

    expect(screen.getAllByTestId("delete-button")).toHaveLength(2);
    expect(screen.getByTestId("answer-form")).toBeInTheDocument();
    expect(screen.getByTestId("answer-form-text")).toBeEnabled();
    expect(screen.getByTestId("answer-form-submit")).toBeEnabled();
  });

  it("should handle creation success", async () => {
    await renderWithProviders(
      <ClarificationsPage
        contestId={contestId}
        problems={problems}
        clarifications={clarifications}
        canCreate
      />,
    );

    fireEvent.change(screen.getByTestId("create-form-problem"), {
      target: { value: problems[0].id },
    });
    fireEvent.change(screen.getByTestId("create-form-text"), {
      target: { value: "Test clarification" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("create-form-submit"));
    });

    expect(clarificationService.createClarification).toHaveBeenCalledWith(
      contestId,
      {
        text: "Test clarification",
        parentId: undefined,
      },
    );
    expect(useToast().success).toHaveBeenCalled();
  });

  it("should render creation error", async () => {
    (
      clarificationService.createClarification as jest.Mock
    ).mockRejectedValueOnce(new Error("Test error"));

    await renderWithProviders(
      <ClarificationsPage
        contestId={contestId}
        problems={problems}
        clarifications={clarifications}
        canCreate
      />,
    );

    fireEvent.change(screen.getByTestId("create-form-problem"), {
      target: { value: problems[0].id },
    });
    fireEvent.change(screen.getByTestId("create-form-text"), {
      target: { value: "Test clarification" },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("create-form-submit"));
    });

    expect(clarificationService.createClarification).toHaveBeenCalledWith(
      contestId,
      {
        text: "Test clarification",
        parentId: undefined,
      },
    );
    expect(useToast().error).toHaveBeenCalled();
  });

  it("should handle delete success", async () => {
    await renderWithProviders(
      <ClarificationsPage
        contestId={contestId}
        problems={problems}
        clarifications={clarifications}
        canAnswer
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getAllByTestId("delete-button")[0]);
    });

    const deleteModal = screen.getByTestId("delete-modal");
    expect(deleteModal).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(
        deleteModal.querySelector("[data-testid='confirm']") as any,
      );
    });

    expect(clarificationService.deleteById).toHaveBeenCalledWith(
      contestId,
      clarifications[1].id,
    );
    await waitFor(() => {
      expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();
    });
    expect(useToast().success).toHaveBeenCalled();
  });

  it("should handle delete error", async () => {
    (clarificationService.deleteById as jest.Mock).mockRejectedValueOnce(
      new Error("Test error"),
    );
    await renderWithProviders(
      <ClarificationsPage
        contestId={contestId}
        problems={problems}
        clarifications={clarifications}
        canAnswer
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getAllByTestId("delete-button")[0]);
    });

    const deleteModal = screen.getByTestId("delete-modal");
    expect(deleteModal).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(
        deleteModal.querySelector("[data-testid='confirm']") as any,
      );
    });

    expect(clarificationService.deleteById).toHaveBeenCalledWith(
      contestId,
      clarifications[1].id,
    );
    expect(useToast().error).toHaveBeenCalled();
  });

  it("should handler answer success", async () => {
    await renderWithProviders(
      <ClarificationsPage
        contestId={contestId}
        problems={problems}
        clarifications={clarifications}
        canAnswer
      />,
    );

    fireEvent.change(screen.getByTestId("answer-form-text"), {
      target: { value: "Test answer" },
    });
    await act(async () => {
      fireEvent.click(screen.getAllByTestId("answer-form-submit")[0]);
    });

    expect(clarificationService.createClarification).toHaveBeenCalledWith(
      contestId,
      {
        text: "Test answer",
        parentId: clarifications[0].id,
      },
    );
    expect(useToast().success).toHaveBeenCalled();
  });

  it("should handle answer error", async () => {
    (
      clarificationService.createClarification as jest.Mock
    ).mockRejectedValueOnce(new Error("Test error"));
    await renderWithProviders(
      <ClarificationsPage
        contestId={contestId}
        problems={problems}
        clarifications={clarifications}
        canAnswer
      />,
    );

    fireEvent.change(screen.getByTestId("answer-form-text"), {
      target: { value: "Test answer" },
    });
    await act(async () => {
      fireEvent.click(screen.getAllByTestId("answer-form-submit")[0]);
    });

    expect(clarificationService.createClarification).toHaveBeenCalledWith(
      contestId,
      {
        text: "Test answer",
        parentId: clarifications[0].id,
      },
    );
    expect(useToast().error).toHaveBeenCalled();
  });
});
