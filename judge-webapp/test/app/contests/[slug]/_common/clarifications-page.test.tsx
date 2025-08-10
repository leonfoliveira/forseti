import { act, fireEvent, render, screen } from "@testing-library/react";
import { ClarificationsPage } from "@/app/contests/[slug]/_common/clarifications-page";
import { clarificationService, contestService } from "@/config/composition";
import { mockAlert } from "@/test/jest.setup";

jest.mock("@/config/composition");
jest.mock("@/app/_component/modal/dialog-modal", () => ({
  DialogModal: ({ children, modal, onConfirm }: any) => (
    <>
      {modal.isOpen && (
        <div data-testid="dialog-modal">
          {children}
          <button
            onClick={() => onConfirm(modal.props)}
            data-testid="dialog-modal:button"
          ></button>
        </div>
      )}
    </>
  ),
}));

describe("ClarificationsPage", () => {
  it("should render empty when there are no clarifications", () => {
    render(<ClarificationsPage contest={{ clarifications: [] } as any} />);

    expect(screen.queryByTestId("create-form")).not.toBeInTheDocument();
    expect(screen.getByTestId("empty")).toBeInTheDocument();
  });

  it("should render clarifications without problem and answers when provided", () => {
    const clarifications = [
      {
        id: "1",
        member: { name: "Member" },
        createdAt: new Date().toISOString(),
        text: "Clarification 1",
        children: [],
      },
    ];

    render(<ClarificationsPage contest={{ clarifications } as any} />);

    expect(screen.queryByTestId("empty")).not.toBeInTheDocument();
    expect(screen.getByTestId("clarification-problem")).toHaveTextContent(
      "{contestant} | General",
    );
    expect(screen.getByTestId("clarification-timestamp")).toHaveTextContent(
      clarifications[0].createdAt,
    );
    expect(screen.getByTestId("clarification-text")).toHaveTextContent(
      clarifications[0].text,
    );
  });

  it("should render clarifications with problem and answers when provided", () => {
    const clarifications = [
      {
        id: "1",
        member: { name: "Member" },
        problem: { id: "1", name: "Problem 1" },
        createdAt: new Date().toISOString(),
        text: "Clarification 1",
        children: [
          {
            id: "2",
            member: { name: "Jury Member" },
            createdAt: new Date().toISOString(),
            text: "Answer to Clarification 1",
          },
        ],
      },
    ];

    render(<ClarificationsPage contest={{ clarifications } as any} />);

    expect(screen.getByTestId("clarification-problem")).toHaveTextContent(
      "{contestant} | Problem {letter}",
    );
    expect(screen.getByTestId("clarification-timestamp")).toHaveTextContent(
      clarifications[0].createdAt,
    );
    expect(screen.getByTestId("clarification-text")).toHaveTextContent(
      clarifications[0].text,
    );
    expect(screen.getByTestId("clarification-answer-header")).toHaveTextContent(
      "RE: {judge}",
    );
    expect(
      screen.getByTestId("clarification-answer-timestamp"),
    ).toHaveTextContent(clarifications[0].children[0].createdAt);
    expect(screen.getByTestId("clarification-answer-text")).toHaveTextContent(
      clarifications[0].children[0].text,
    );
  });

  it("should alert error on create failure", async () => {
    (contestService.createClarification as jest.Mock).mockRejectedValueOnce(
      new Error("Create error"),
    );

    render(
      <ClarificationsPage
        contest={{ problems: [{ id: "1" }], clarifications: [] } as any}
        canCreate
      />,
    );

    fireEvent.change(screen.getByTestId("form-problem"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByTestId("form-text"), {
      target: { value: "New Clarification" },
    });
    expect(screen.getByTestId("form-submit")).toHaveTextContent("Submit");
    await act(async () => {
      fireEvent.click(screen.getByTestId("form-submit"));
    });

    expect(mockAlert.error).toHaveBeenCalledWith({
      defaultMessage: "Failed to create clarification",
      id: "app.contests.[slug]._common.clarifications-page.create-error",
    });
  });

  it("should alert success on create success", async () => {
    (contestService.createClarification as jest.Mock).mockResolvedValueOnce({});

    render(
      <ClarificationsPage
        contest={{ problems: [{ id: "1" }], clarifications: [] } as any}
        canCreate
      />,
    );

    fireEvent.change(screen.getByTestId("form-problem"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByTestId("form-text"), {
      target: { value: "New Clarification" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("form-submit"));
    });

    expect(mockAlert.success).toHaveBeenCalledWith({
      defaultMessage: "Clarification created successfully",
      id: "app.contests.[slug]._common.clarifications-page.create-success",
    });
  });

  it("should alert error on create answer failure", async () => {
    (contestService.createClarification as jest.Mock).mockRejectedValueOnce(
      new Error("Create error"),
    );

    render(
      <ClarificationsPage
        contest={
          {
            problems: [{ id: "1" }],
            clarifications: [
              {
                id: "1",
                member: { name: "Member" },
                createdAt: new Date().toISOString(),
                text: "Clarification 1",
                children: [],
              },
            ],
          } as any
        }
        canAnswer
      />,
    );

    expect(screen.getByTestId("clarification-answer")).toHaveTextContent(
      "Answer",
    );
    act(() => {
      fireEvent.click(screen.getByTestId("clarification-answer"));
    });
    fireEvent.change(screen.getByTestId("form-answer-text"), {
      target: { value: "New Clarification" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-modal:button"));
    });

    expect(mockAlert.error).toHaveBeenCalledWith({
      defaultMessage: "Failed to create clarification",
      id: "app.contests.[slug]._common.clarifications-page.create-error",
    });
  });

  it("should alert success on create answer success", async () => {
    (contestService.createClarification as jest.Mock).mockResolvedValueOnce({});

    render(
      <ClarificationsPage
        contest={
          {
            problems: [{ id: "1" }],
            clarifications: [
              {
                id: "1",
                member: { name: "Member" },
                createdAt: new Date().toISOString(),
                text: "Clarification 1",
                children: [],
              },
            ],
          } as any
        }
        canAnswer
      />,
    );

    act(() => {
      fireEvent.click(screen.getByTestId("clarification-answer"));
    });
    fireEvent.change(screen.getByTestId("form-answer-text"), {
      target: { value: "New Clarification" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-modal:button"));
    });

    expect(mockAlert.success).toHaveBeenCalledWith({
      defaultMessage: "Clarification created successfully",
      id: "app.contests.[slug]._common.clarifications-page.create-success",
    });
  });

  it("should alert error on delete clarification failure", async () => {
    (clarificationService.deleteById as jest.Mock).mockRejectedValueOnce(
      new Error("Delete error"),
    );

    const clarifications = [
      {
        id: "1",
        member: { name: "Member" },
        createdAt: new Date().toISOString(),
        text: "Clarification 1",
        children: [],
      },
    ];

    render(
      <ClarificationsPage contest={{ clarifications } as any} canAnswer />,
    );

    act(() => {
      fireEvent.click(screen.getByTestId("clarification-delete"));
    });
    expect(screen.getByTestId("dialog-modal")).toHaveTextContent(
      "Are you sure you want to delete this clarification?",
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-modal:button"));
    });

    expect(mockAlert.error).toHaveBeenCalledWith({
      defaultMessage: "Failed to delete clarification",
      id: "app.contests.[slug]._common.clarifications-page.delete-error",
    });
  });

  it("should alert success on delete clarification success", async () => {
    (clarificationService.deleteById as jest.Mock).mockResolvedValueOnce({});

    const clarifications = [
      {
        id: "1",
        member: { name: "Member" },
        createdAt: new Date().toISOString(),
        text: "Clarification 1",
        children: [],
      },
    ];

    render(
      <ClarificationsPage contest={{ clarifications } as any} canAnswer />,
    );

    act(() => {
      fireEvent.click(screen.getByTestId("clarification-delete"));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-modal:button"));
    });

    expect(mockAlert.success).toHaveBeenCalledWith({
      defaultMessage: "Clarification deleted successfully",
      id: "app.contests.[slug]._common.clarifications-page.delete-success",
    });
  });
});
