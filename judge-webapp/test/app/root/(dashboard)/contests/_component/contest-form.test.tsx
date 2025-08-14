import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { useForm } from "react-hook-form";

import { ContestForm } from "@/app/root/(dashboard)/contests/_component/contest-form";
import { ContestFormType } from "@/app/root/(dashboard)/contests/_form/contest-form";
import { contestService } from "@/config/composition";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { useContestStatusWatcher } from "@/lib/util/contest-status-watcher";
import { mockAlert } from "@/test/jest.setup";

jest.mock("@/config/composition");
jest.mock("@/lib/util/contest-status-watcher", () => ({
  useContestStatusWatcher: jest.fn(() => ContestStatus.NOT_STARTED),
}));
jest.mock("@/lib/component/modal/dialog-modal", () => ({
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
    const form = renderHook(() => useForm<ContestFormType>());
    const props = {
      contestState: {} as any,
      saveState: {} as any,
      onSubmit: jest.fn(),
      form: form.result.current,
    };

    render(<ContestForm {...props} />);

    expect(mockAlert.warning).toHaveBeenCalledWith({
      defaultMessage:
        "This contest is in progress, be careful when editing it.",
      id: "app.root.(dashboard).contests._component.contest-form.in-progress",
    });
  });

  it("should alert error when delete fails", async () => {
    (contestService.deleteContest as jest.Mock).mockRejectedValueOnce(
      new Error("delete-error"),
    );
    const form = renderHook(() => useForm<ContestFormType>());
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
      "Are you sure you want to delete this contest?",
    );
    fireEvent.click(screen.getByTestId("dialog-modal:button"));
    expect(screen.getByTestId("dialog-modal:loading")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.queryByTestId("dialog-modal:loading"),
      ).not.toBeInTheDocument();
    });
    expect(mockAlert.error).toHaveBeenCalledWith({
      defaultMessage: "An error occurred while deleting the contest.",
      id: "app.root.(dashboard).contests._component.contest-form.delete-error",
    });
  });

  it("should alert success when delete is successful", async () => {
    const form = renderHook(() => useForm<ContestFormType>());
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
      "Are you sure you want to delete this contest?",
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-modal:button"));
    });
    expect(mockAlert.success).toHaveBeenCalledWith({
      defaultMessage: "The contest has been successfully deleted.",
      id: "app.root.(dashboard).contests._component.contest-form.delete-success",
    });
  });

  it("should call save on create", async () => {
    const { result } = renderHook(() => useForm<ContestFormType>());
    const props = {
      contestState: undefined,
      saveState: {} as any,
      onSubmit: jest.fn(),
      form: result.current,
    };

    render(<ContestForm {...props} />);

    expect(screen.getByTestId("header")).toHaveTextContent("Contest New");
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

    expect(screen.getByTestId("members-header")).toHaveTextContent("Members");
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

    expect(screen.getByTestId("problems-header")).toHaveTextContent("Problems");
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
      "Are you sure you want to save this contest?",
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-modal:button"));
    });
    expect(props.onSubmit).toHaveBeenCalledWith(result.current.getValues());
  });

  it("should call save on update", async () => {
    const { result } = renderHook(() => useForm<ContestFormType>());
    const props = {
      contestState: { data: { id: "123" } } as any,
      saveState: {} as any,
      onSubmit: jest.fn(),
      form: result.current,
    };
    result.current.setValue("members", [{ _id: "1" }] as any);
    result.current.setValue("problems", [{ _id: "2", letter: "A" }] as any);

    render(<ContestForm {...props} />);

    expect(screen.getByTestId("header")).toHaveTextContent("Contest #{id}");
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
      "Are you sure you want to save this contest?",
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-modal:button"));
    });
    expect(props.onSubmit).toHaveBeenCalledWith(result.current.getValues());
  });
});
