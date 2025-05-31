import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthRoot from "@/app/auth/root/page";
import { useRootSignInAction } from "@/app/_action/sign-in-root-action";

jest.mock("@/app/_action/sign-in-root-action", () => ({
  useRootSignInAction: jest.fn(),
}));

describe("AuthRoot", () => {
  const mockSignInAction = {
    isLoading: false,
    act: jest.fn(),
  };

  beforeEach(() => {
    (useRootSignInAction as jest.Mock).mockReturnValue(mockSignInAction);
  });

  it("renders the form and title", () => {
    render(<AuthRoot />);
    expect(screen.getByTestId("form")).toBeInTheDocument();
    expect(screen.getByTestId("password")).toBeInTheDocument();
    expect(screen.getByTestId("signin")).toBeInTheDocument();
  });

  it("calls signInAction.act with form values on submit", async () => {
    render(<AuthRoot />);

    fireEvent.change(screen.getByTestId("password:input"), {
      target: { value: "secret" },
    });

    fireEvent.click(screen.getByTestId("signin"));

    await waitFor(() => {
      expect(mockSignInAction.act).toHaveBeenCalledWith({
        password: "secret",
      });
    });
  });

  it("shows spinner when loading", () => {
    (useRootSignInAction as jest.Mock).mockReturnValue({
      ...mockSignInAction,
      isLoading: true,
    });

    render(<AuthRoot />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });
});
