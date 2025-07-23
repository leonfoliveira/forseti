import { act, fireEvent, render, screen } from "@testing-library/react";
import RootNewContestPage from "@/app/root/(dashboard)/contests/new/page";
import { contestService } from "@/config/composition";
import { mockAlert, mockRouter } from "@/test/jest.setup";
import { routes } from "@/config/routes";

jest.mock("@/config/composition");

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

describe("RootNewContestPage", () => {
  it("should alert error on create failure", async () => {
    (contestService.createContest as jest.Mock).mockRejectedValueOnce(
      new Error("Create error"),
    );

    render(<RootNewContestPage />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("submit"));
    });
    expect(mockAlert.error).toHaveBeenCalledWith("create-error");
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

    expect(mockAlert.success).toHaveBeenCalledWith("create-success");
    expect(mockRouter.push).toHaveBeenCalledWith(
      routes.ROOT_CONTESTS_EDIT(mockContest.id),
    );
  });
});
