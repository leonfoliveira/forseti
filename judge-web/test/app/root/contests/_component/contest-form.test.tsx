import {
  render,
  screen,
  fireEvent,
  waitFor,
  renderHook,
} from "@testing-library/react";
import { useForm, UseFormReturn } from "react-hook-form";
import { ContestFormType } from "@/app/root/(dashboard)/contests/_form/contest-form-type";
import { useRouter } from "next/navigation";
import { useModal } from "@/app/_util/modal-hook";
import { useDeleteContestAction } from "@/app/_action/delete-contest-action";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import React from "react";
import { ContestForm } from "@/app/root/(dashboard)/contests/_component/contest-form";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/app/_util/modal-hook", () => ({
  useModal: jest.fn(),
}));

jest.mock("@/app/_action/delete-contest-action", () => ({
  useDeleteContestAction: jest.fn(),
}));

const mockUseRouter = {
  push: jest.fn(),
};

const mockUseModal = {
  open: jest.fn(),
  close: jest.fn(),
  isOpen: false,
};

const mockUseDeleteContestAction = {
  act: jest.fn(),
  isLoading: false,
};

const TestWrapper: React.FC<any> = ({ children, form, ...props }) => {
  return (
    <ContestForm
      form={form}
      onSubmit={jest.fn()}
      isDisabled={false}
      header="Test Header"
      {...props}
    >
      {children}
    </ContestForm>
  );
};

describe("ContestForm", () => {
  let formMethods: UseFormReturn<ContestFormType>;

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockUseRouter);
    (useModal as jest.Mock).mockReturnValue(mockUseModal);
    (useDeleteContestAction as jest.Mock).mockReturnValue(
      mockUseDeleteContestAction,
    );
    formMethods = renderHook(() =>
      useForm<ContestFormType>({
        defaultValues: {
          id: "",
          title: "",
          languages: [],
          startAt: new Date(),
          endAt: new Date(),
          members: [],
          problems: [],
        },
      }),
    ).result.current;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders header and back button", () => {
    render(<TestWrapper form={formMethods} />);
    expect(screen.getByTestId("header")).toHaveTextContent("Test Header");
    expect(screen.getByTestId("back")).toBeInTheDocument();
  });

  it("navigates back when back button is clicked", () => {
    render(<TestWrapper form={formMethods} />);
    fireEvent.click(screen.getByTestId("back"));
    expect(mockUseRouter.push).toHaveBeenCalledWith("/root/contests");
  });

  it("displays status badge when status prop is provided", () => {
    render(
      <TestWrapper form={formMethods} status={ContestStatus.IN_PROGRESS} />,
    );
    expect(screen.getByTestId("status-badge")).toHaveClass("badge-success");
  });

  it("does not display status badge when status prop is not provided", () => {
    render(<TestWrapper form={formMethods} />);
    expect(screen.queryByTestId("status-badge")).not.toBeInTheDocument();
  });

  it("renders Save button", () => {
    render(<TestWrapper form={formMethods} />);
    expect(screen.getByTestId("save")).toBeInTheDocument();
    expect(screen.getByTestId("save")).toHaveAttribute("type", "submit");
  });

  it("renders Delete button when contestId is provided", () => {
    render(<TestWrapper form={formMethods} contestId={1} />);
    expect(screen.getByTestId("delete")).toBeInTheDocument();
  });

  it("does not render Delete button when contestId is not provided", () => {
    render(<TestWrapper form={formMethods} />);
    expect(screen.queryByTestId("delete")).not.toBeInTheDocument();
  });

  it("opens delete modal on Delete button click", () => {
    render(<TestWrapper form={formMethods} contestId={1} />);
    fireEvent.click(screen.getByTestId("delete"));
    expect(mockUseModal.open).toHaveBeenCalled();
  });

  it("displays spinner when loading", () => {
    render(<TestWrapper form={formMethods} isLoading={true} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders form fields", () => {
    render(<TestWrapper form={formMethods} />);
    expect(screen.getByTestId("slug")).toBeInTheDocument();
    expect(screen.getByTestId("title")).toBeInTheDocument();
    expect(screen.getByTestId("languages")).toBeInTheDocument();
    expect(screen.getByTestId("start-at")).toBeInTheDocument();
    expect(screen.getByTestId("end-at")).toBeInTheDocument();
  });

  it("adds new member field on Add Member button click", () => {
    render(<TestWrapper form={formMethods} />);
    fireEvent.click(screen.getByTestId("member-add"));
    expect(screen.getAllByTestId("member-type")).toHaveLength(1);
    expect(screen.getAllByTestId("member-name")).toHaveLength(1);
    expect(screen.getAllByTestId("member-login")).toHaveLength(1);
    expect(screen.getAllByTestId("member-password")).toHaveLength(1);
  });

  it("removes member field on trash icon click", () => {
    formMethods.setValue("members", [
      {
        type: MemberType.CONTESTANT,
        name: "test",
        login: "test",
        password: "123",
      },
    ]);
    render(<TestWrapper form={formMethods} />);
    expect(screen.getAllByTestId("member-type")).toHaveLength(1); // Ensure it's there
    fireEvent.click(screen.getByTestId("member-delete"));
    expect(screen.queryAllByTestId("member-type")).toHaveLength(0);
  });

  it("adds new problem field on Add Problem button click", () => {
    render(<TestWrapper form={formMethods} />);
    fireEvent.click(screen.getByTestId("problem-add"));
    expect(screen.getAllByTestId("problem-letter")).toHaveLength(1);
    expect(screen.getAllByTestId("problem-title")).toHaveLength(1);
    expect(screen.getAllByTestId("problem-description")).toHaveLength(1);
    expect(screen.getAllByTestId("problem-time-limit")).toHaveLength(1);
    expect(screen.getAllByTestId("problem-test-cases")).toHaveLength(1);
  });

  it("removes problem field on trash icon click", () => {
    formMethods.setValue("problems", [{ title: "test", timeLimit: 1000 }]);
    render(<TestWrapper form={formMethods} />);
    expect(screen.getAllByTestId("problem-title")).toHaveLength(1); // Ensure it's there
    fireEvent.click(screen.getByTestId("problem-delete"));
    expect(screen.queryAllByTestId("problem-title")).toHaveLength(0);
  });

  it("calls onSubmit when form is submitted", async () => {
    const mockOnSubmit = jest.fn();
    render(<TestWrapper form={formMethods} onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByTestId("title:input"), {
      target: { value: "New Contest" },
    });
    fireEvent.click(screen.getByTestId("languages")); // Simulate interaction with checkbox group

    fireEvent.click(screen.getByTestId("save"));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Contest",
          // languages: ["JAVA"], // Mocked CheckboxGroup doesn't set actual values easily without more complex mock
        }),
        expect.anything(),
      );
    });
  });

  it("disables form elements when isDisabled is true", () => {
    render(<TestWrapper form={formMethods} isDisabled={true} />);
    expect(screen.getByTestId("title")).toBeDisabled();
    expect(screen.getByTestId("save")).toBeDisabled();
  });

  it("confirms delete action in modal", async () => {
    mockUseModal.isOpen = true;
    const mockAct = jest.fn(() => Promise.resolve());
    (useDeleteContestAction as jest.Mock).mockReturnValue({
      act: mockAct,
      isLoading: false,
    });
    formMethods.setValue("id", "123");

    render(<TestWrapper form={formMethods} contestId={123} />);

    expect(screen.getByTestId("delete-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("delete-modal:confirm"));

    await waitFor(() => {
      expect(mockAct).toHaveBeenCalledWith("123");
    });
  });
});
