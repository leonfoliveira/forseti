import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthRoot from "@/app/root/sign-in/page";
import { useRootSignInAction } from "@/app/_action/root-sign-in-action";

jest.mock("@/app/_action/root-sign-in-action", () => ({
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
    expect(screen.getByTestId("sign-in")).toBeInTheDocument();
  });

  it("calls signInAction.act with form values on submit", async () => {
    render(<AuthRoot />);

    fireEvent.change(screen.getByTestId("password:input"), {
      target: { value: "secret" },
    });

    fireEvent.click(screen.getByTestId("sign-in"));

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
    expect(screen.getByTestId("sign-in:spinner")).toBeInTheDocument();
  });
});
