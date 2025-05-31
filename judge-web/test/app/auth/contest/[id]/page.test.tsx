import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useMemberSignInAction } from "@/app/_action/sign-in-action-member";
import { useFindContestSummaryByIdAction } from "@/app/_action/find-contest-summary-action";
import { use } from "react";
import AuthMember from "@/app/auth/contests/[id]/page";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: jest.fn(),
}));

jest.mock("@/app/_action/sign-in-action-member", () => ({
  useMemberSignInAction: jest.fn(),
}));

jest.mock("@/app/_action/find-contest-summary-action", () => ({
  useFindContestSummaryByIdAction: jest.fn(),
}));

const mockUse = use as jest.Mock;

describe("AuthMember", () => {
  const id = 123;

  const mockFindContestSummaryByIdAction = {
    isLoading: false,
    data: { title: "Mock Contest" },
    act: jest.fn(),
  };

  const mockMemberSignInAction = {
    isLoading: false,
    act: jest.fn(),
  };

  const getParams = Promise.resolve({ id });

  beforeEach(async () => {
    mockUse.mockReturnValue({ id });
    (useFindContestSummaryByIdAction as jest.Mock).mockReturnValue(
      mockFindContestSummaryByIdAction,
    );
    (useMemberSignInAction as jest.Mock).mockReturnValue(
      mockMemberSignInAction,
    );
  });

  it("renders spinner while loading contest data", () => {
    (useFindContestSummaryByIdAction as jest.Mock).mockReturnValue({
      ...mockFindContestSummaryByIdAction,
      isLoading: true,
    });

    render(<AuthMember params={getParams} />);
    expect(screen.getByTestId("contest-spinner")).toBeInTheDocument();
  });

  it("renders contest title and form", async () => {
    render(<AuthMember params={getParams} />);
    await waitFor(() => {
      expect(screen.getByTestId("contest-title")).toHaveTextContent(
        "Mock Contest",
      );
      expect(screen.getByTestId("form")).toBeInTheDocument();
    });
  });

  it("calls memberSignInAction.act on form submit", async () => {
    render(<AuthMember params={getParams} />);

    fireEvent.change(screen.getByTestId("login:input"), {
      target: { value: "user" },
    });
    fireEvent.change(screen.getByTestId("password:input"), {
      target: { value: "pass" },
    });

    fireEvent.click(screen.getByTestId("signin"));

    await waitFor(() => {
      expect(mockMemberSignInAction.act).toHaveBeenCalledWith(id, {
        login: "user",
        password: "pass",
      });
    });
  });

  it("shows spinner on sign-in action loading", async () => {
    (useMemberSignInAction as jest.Mock).mockReturnValue({
      ...mockMemberSignInAction,
      isLoading: true,
    });

    render(<AuthMember params={getParams} />);

    expect(await screen.findByTestId("signin-spinner")).toBeInTheDocument();
  });
});
