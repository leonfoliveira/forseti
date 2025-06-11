import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useMemberSignInAction } from "@/app/_action/member-sign-in-action";
import { useFindContestMetadataBySlugAction } from "@/app/_action/find-contest-metadata-by-slug-action";
import { use } from "react";
import AuthMember from "@/app/contests/[slug]/sign-in/page";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: jest.fn(),
}));

jest.mock("@/app/_action/member-sign-in-action", () => ({
  useMemberSignInAction: jest.fn(),
}));

jest.mock("@/app/_action/find-contest-metadata-by-slug-action", () => ({
  useFindContestMetadataBySlugAction: jest.fn(),
}));

const mockUse = use as jest.Mock;

describe("AuthMember", () => {
  const slug = "123";

  const mockFindContestSummaryByIdAction = {
    isLoading: false,
    data: { id: "abc", title: "Mock Contest" },
    act: jest.fn(),
  };

  const mockMemberSignInAction = {
    isLoading: false,
    act: jest.fn(),
  };

  const getParams = Promise.resolve({ slug });

  beforeEach(async () => {
    mockUse.mockReturnValue({ slug });
    (useFindContestMetadataBySlugAction as jest.Mock).mockReturnValue(
      mockFindContestSummaryByIdAction,
    );
    (useMemberSignInAction as jest.Mock).mockReturnValue(
      mockMemberSignInAction,
    );
  });

  it("renders spinner while loading contest data", () => {
    (useFindContestMetadataBySlugAction as jest.Mock).mockReturnValue({
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

    fireEvent.click(screen.getByTestId("sign-in"));

    await waitFor(() => {
      expect(mockMemberSignInAction.act).toHaveBeenCalledWith(
        mockFindContestSummaryByIdAction.data.id,
        {
          login: "user",
          password: "pass",
        },
      );
    });
  });

  it("shows spinner on sign-in action loading", async () => {
    (useMemberSignInAction as jest.Mock).mockReturnValue({
      ...mockMemberSignInAction,
      isLoading: true,
    });

    render(<AuthMember params={getParams} />);

    expect(await screen.findByTestId("sign-in:spinner")).toBeInTheDocument();
  });
});
