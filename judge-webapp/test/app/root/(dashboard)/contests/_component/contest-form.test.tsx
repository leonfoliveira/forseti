import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { ContestForm } from "@/app/root/(dashboard)/contests/_component/contest-form";
import { useForm } from "react-hook-form";
import { ContestFormD } from "@/app/root/(dashboard)/contests/_form/contest-form";
import { useContestStatusWatcher } from "@/app/_util/contest-status-watcher";
import { mockAlert } from "@/test/jest.setup";
import { contestService } from "@/config/composition";
import { MemberType } from "@/core/domain/enumerate/MemberType";

jest.mock("@/config/composition");
jest.mock("@/app/_util/contest-status-watcher", () => ({
  useContestStatusWatcher: jest.fn(() => ContestStatus.NOT_STARTED),
}));

jest.mock("@/app/_util/contest-formatter-hook", () => ({
  useContestFormatter: jest.fn(() => ({
    formatLanguage: jest.fn(),
  })),
}));

jest.mock(
  "@/app/root/(dashboard)/contests/_component/contest-status-badge",
  () => ({
    ContestStatusBadge: ({ contest }: any) => (
      <span data-testid="contest-status-badge">{contest.id}</span>
    ),
  }),
);

jest.mock("@/app/_component/dialog-modal", () => ({
  DialogModal: ({ children, modal, onConfirm, isLoading }: any) => (
    <>
      {modal.isOpen && (
        <div data-testid="dialog-modal">
          {children}
          {isLoading && <span data-testid="dialog-modal:loading" />}
          <button
            onClick={() => onConfirm(modal.props)}
            data-testid="dialog-modal:button"
          ></button>
        </div>
      )}
    </>
  ),
}));

describe("ContestForm", () => {
  it("should alert warning when contest is in progress", () => {
    (useContestStatusWatcher as jest.Mock).mockReturnValueOnce(
      ContestStatus.IN_PROGRESS,
    );
    const form = renderHook(() => useForm<ContestFormD>());
    const props = {
      contestState: {} as any,
      saveState: {} as any,
      onSubmit: jest.fn(),
      form: form.result.current,
    };

    render(<ContestForm {...props} />);

    expect(mockAlert.warning).toHaveBeenCalledWith("in-progress");
  });

  it("should alert error when delete fails", async () => {
    (contestService.deleteContest as jest.Mock).mockRejectedValueOnce(
      new Error("delete-error"),
    );
    const form = renderHook(() => useForm<ContestFormD>());
    const props = {
      contestState: { data: { id: "123" } } as any,
      saveState: {} as any,
      onSubmit: jest.fn(),
      form: form.result.current,
    };

    render(<ContestForm {...props} />);

    act(() => {
      fireEvent.click(screen.getByTestId("delete"));
    });
    expect(screen.getByTestId("dialog-modal")).toHaveTextContent(
      "confirm-delete-content",
    );
    fireEvent.click(screen.getByTestId("dialog-modal:button"));
    expect(screen.getByTestId("dialog-modal:loading")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.queryByTestId("dialog-modal:loading"),
      ).not.toBeInTheDocument();
    });
    expect(mockAlert.error).toHaveBeenCalledWith("delete-error");
  });

  it("should alert success when delete is successful", async () => {
    const form = renderHook(() => useForm<ContestFormD>());
    const props = {
      contestState: { data: { id: "123" } } as any,
      saveState: {} as any,
      onSubmit: jest.fn(),
      form: form.result.current,
    };

    render(<ContestForm {...props} />);

    act(() => {
      fireEvent.click(screen.getByTestId("delete"));
    });
    expect(screen.getByTestId("dialog-modal")).toHaveTextContent(
      "confirm-delete-content",
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-modal:button"));
    });
    expect(mockAlert.success).toHaveBeenCalledWith("delete-success");
  });

  it("should call save on create", async () => {
    const { result } = renderHook(() => useForm<ContestFormD>());
    const props = {
      contestState: undefined,
      saveState: {} as any,
      onSubmit: jest.fn(),
      form: result.current,
    };

    render(<ContestForm {...props} />);

    expect(screen.getByTestId("header")).toHaveTextContent("create-header");
    expect(screen.queryByTestId("delete")).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId("slug"), {
      target: { value: "slug" },
    });
    fireEvent.change(screen.getByTestId("title"), {
      target: { value: "title" },
    });
    fireEvent.click(screen.getAllByTestId("languages:checkbox")[0]);
    fireEvent.change(screen.getByTestId("start-at"), {
      target: { value: "2025-01-01T00:00" },
    });
    fireEvent.change(screen.getByTestId("end-at"), {
      target: { value: "2025-01-02T00:00" },
    });

    expect(screen.getByTestId("members-header")).toHaveTextContent(
      "members-header",
    );
    expect(screen.getByTestId("members")).toBeEmptyDOMElement();
    act(() => {
      fireEvent.click(screen.getByTestId("member-add"));
    });
    fireEvent.change(screen.getByTestId("member-type"), {
      target: { value: MemberType.CONTESTANT },
    });
    fireEvent.change(screen.getByTestId("member-name"), {
      target: { value: "Member" },
    });
    fireEvent.change(screen.getByTestId("member-login"), {
      target: { value: "member" },
    });
    fireEvent.change(screen.getByTestId("member-password"), {
      target: { value: "password" },
    });

    expect(screen.getByTestId("problems-header")).toHaveTextContent(
      "problems-header",
    );
    expect(screen.getByTestId("problems")).toBeEmptyDOMElement();
    act(() => {
      fireEvent.click(screen.getByTestId("problem-add"));
    });
    fireEvent.change(screen.getByTestId("problem-letter"), {
      target: { value: "A" },
    });
    fireEvent.change(screen.getByTestId("problem-title"), {
      target: { value: "Problem A" },
    });
    fireEvent.change(screen.getByTestId("problem-description"), {
      target: { files: [new File(["description"], "description.pdf")] },
    });
    fireEvent.change(screen.getByTestId("problem-time-limit"), {
      target: { value: "1000" },
    });
    fireEvent.change(screen.getByTestId("problem-memory-limit"), {
      target: { value: "512" },
    });
    fireEvent.change(screen.getByTestId("problem-test-cases"), {
      target: { files: [new File(["test-cases"], "test-cases.csv")] },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("save"));
    });
    expect(screen.getByTestId("dialog-modal")).toHaveTextContent(
      "confirm-save-content",
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-modal:button"));
    });
    expect(props.onSubmit).toHaveBeenCalledWith(result.current.getValues());
  });

  it("should call save on update", async () => {
    const { result } = renderHook(() => useForm<ContestFormD>());
    const props = {
      contestState: { data: { id: "123" } } as any,
      saveState: {} as any,
      onSubmit: jest.fn(),
      form: result.current,
    };
    result.current.setValue("members", [{ _id: "1" }] as any);
    result.current.setValue("problems", [{ _id: "2", letter: "A" }] as any);

    render(<ContestForm {...props} />);

    expect(screen.getByTestId("header")).toHaveTextContent("edit-header");
    expect(screen.getByTestId("delete")).toBeInTheDocument();

    const members = screen.getByTestId("members");
    expect(members).not.toBeEmptyDOMElement();
    act(() => {
      fireEvent.click(screen.getByTestId("member-delete"));
    });
    expect(members).toBeEmptyDOMElement();

    const problems = screen.getByTestId("problems");
    expect(problems).not.toBeEmptyDOMElement();
    act(() => {
      fireEvent.click(screen.getByTestId("problem-delete"));
    });
    expect(problems).toBeEmptyDOMElement();

    await act(async () => {
      fireEvent.click(screen.getByTestId("save"));
    });
    expect(screen.getByTestId("dialog-modal")).toHaveTextContent(
      "confirm-save-content",
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-modal:button"));
    });
    expect(props.onSubmit).toHaveBeenCalledWith(result.current.getValues());
  });
});
