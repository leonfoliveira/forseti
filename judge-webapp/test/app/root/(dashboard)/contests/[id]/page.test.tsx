import { act, fireEvent, render, screen } from "@testing-library/react";
import RootEditContestPage from "@/app/root/(dashboard)/contests/[id]/page";
import { contestService } from "@/config/composition";
import { mockAlert } from "@/test/jest.setup";
import { TestCaseUtils } from "@/app/root/(dashboard)/contests/_util/TestCaseUtils";

jest.mock("@/config/composition");
jest.mock("@/app/root/(dashboard)/contests/_component/contest-form", () => ({
  ContestForm: ({ contestState, onSubmit }: any) => (
    <>
      <p data-testid="contest-id">{contestState.data?.id}</p>
      <button onClick={onSubmit} data-testid="submit" />
    </>
  ),
}));

jest.mock("@/app/root/(dashboard)/contests/_form/contest-form-map", () => ({
  ContestFormMap: {
    fromResponseDTO: jest.fn((it) => it),
    toUpdateRequestDTO: jest.fn((it) => it),
  },
}));

jest.mock("@/app/root/(dashboard)/contests/_util/TestCaseUtils", () => ({
  TestCaseUtils: {
    validateProblemList: jest.fn().mockResolvedValue([]),
  },
}));

describe("RootEditContestPage", () => {
  it("should alert error on load failure", async () => {
    (contestService.findFullContestById as jest.Mock).mockRejectedValue(
      new Error("Load error"),
    );

    const params = Promise.resolve({ id: "1" });
    await act(async () => {
      render(<RootEditContestPage params={params} />);
    });

    expect(mockAlert.error).toHaveBeenCalledWith({
      defaultMessage: "Error loading contest data",
      id: "app.root.(dashboard).contests.[id].page.load-error",
    });
  });

  it("should render contest form", async () => {
    const contest = { id: "1" };
    (contestService.findFullContestById as jest.Mock).mockResolvedValueOnce(
      contest,
    );

    const params = Promise.resolve({ id: "1" });
    await act(async () => {
      render(<RootEditContestPage params={params} />);
    });

    expect(screen.getByTestId("contest-id")).toHaveTextContent("1");
  });

  it("should submit form and handle validation error", async () => {
    const contest = { id: "1" };
    (contestService.findFullContestById as jest.Mock).mockResolvedValueOnce(
      contest,
    );
    (TestCaseUtils.validateProblemList as jest.Mock).mockResolvedValueOnce([
      "A",
      "B",
    ]);

    const params = Promise.resolve({ id: "1" });
    await act(async () => {
      render(<RootEditContestPage params={params} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("submit"));
    });
    expect(mockAlert.warning).toHaveBeenCalledWith({
      defaultMessage:
        "Test cases file must have exactly two columns and at least one row. Failed problems: {letters}",
      id: "app.root.(dashboard).contests.[id].page.test-cases-validation-error",
      values: {
        letters: "A, B",
      },
    });
  });

  it("should submit form successfully", async () => {
    const contest = { id: "1" };
    (contestService.findFullContestById as jest.Mock).mockResolvedValueOnce(
      contest,
    );
    (contestService.updateContest as jest.Mock).mockResolvedValueOnce(contest);

    const params = Promise.resolve({ id: "1" });
    await act(async () => {
      render(<RootEditContestPage params={params} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("submit"));
    });
    expect(mockAlert.success).toHaveBeenCalledWith({
      defaultMessage: "Contest updated successfully",
      id: "app.root.(dashboard).contests.[id].page.update-success",
    });
  });
});
