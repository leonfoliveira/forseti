import { act, fireEvent, render, screen } from "@testing-library/react";

import RootNewContestPage from "@/app/root/(dashboard)/contests/new/page";
import { contestService } from "@/config/composition";
import { routes } from "@/config/routes";
import { TestCaseValidator } from "@/lib/util/test-case-validator";
import { mockAlert, mockRouter } from "@/test/jest.setup";

jest.mock("@/config/composition");
jest.mock("@/lib/util/test-case-validator");

jest.mock("@/app/root/(dashboard)/contests/_component/contest-form", () => ({
  ContestForm: ({ onSubmit }: any) => (
    <div>
      <button onClick={onSubmit} data-testid="submit">
        Submit
      </button>
    </div>
  ),
}));

jest.mock("@/app/root/(dashboard)/contests/_form/contest-form-map", () => ({
  ContestFormMap: {
    toCreateRequestDTO: (data: any) => data,
  },
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

describe("RootNewContestPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock TestCaseValidator to return no validation errors
    (TestCaseValidator.validateProblemList as jest.Mock).mockResolvedValue([]);
  });

  it("should alert error on create failure", async () => {
    (contestService.createContest as jest.Mock).mockRejectedValueOnce(
      new Error("Create error"),
    );

    render(<RootNewContestPage />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("submit"));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-modal:button"));
    });
    expect(mockAlert.error).toHaveBeenCalledWith({
      defaultMessage: "Error creating contest",
      id: "app.root.(dashboard).contests.new.page.create-error",
    });
  });

  it("should redirect to edit page on successful create", async () => {
    const mockContest = { id: "123" };
    (contestService.createContest as jest.Mock).mockResolvedValueOnce(
      mockContest,
    );

    render(<RootNewContestPage />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("submit"));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-modal:button"));
    });

    expect(mockAlert.success).toHaveBeenCalledWith({
      defaultMessage: "Contest created successfully",
      id: "app.root.(dashboard).contests.new.page.create-success",
    });
    expect(mockRouter.push).toHaveBeenCalledWith(
      routes.ROOT_CONTESTS_EDIT(mockContest.id),
    );
  });

  it("should handle validation errors and not create contest", async () => {
    // Mock validation to return invalid problems
    (TestCaseValidator.validateProblemList as jest.Mock).mockResolvedValue([
      { problem: { letter: "A" }, isValid: false },
      { problem: { letter: "B" }, isValid: true },
    ]);

    render(<RootNewContestPage />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("submit"));
    });

    // Should not call createContest when there are validation errors
    expect(contestService.createContest).not.toHaveBeenCalled();
    expect(mockAlert.success).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
