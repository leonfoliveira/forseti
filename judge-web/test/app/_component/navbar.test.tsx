import { render, screen, waitFor } from "@testing-library/react";
import { Navbar } from "@/app/_component/navbar";
import { ContestSummaryResponseDTO } from "@/core/repository/dto/response/ContestSummaryResponseDTO";
import { authorizationService } from "@/app/_composition";

jest.mock("@/app/_composition", () => ({
  authorizationService: {
    deleteAuthorization: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@/app/_util/authorization-hook", () => ({
  useAuthorization: jest.fn(),
}));

jest.mock("@/app/_util/theme-hook", () => ({
  useTheme: () => ({
    theme: "light",
    toggleTheme: jest.fn(),
  }),
}));

it("renders the contest title when contest is provided", () => {
  render(
    <Navbar
      contest={
        {
          title: "Sample Contest",
          endAt: new Date().toISOString(),
        } as ContestSummaryResponseDTO
      }
      signInPath="/signin"
    />,
  );
  expect(screen.getByTestId("navbar-title")).toHaveTextContent(
    "Sample Contest",
  );
});

it("renders an empty contest title when contest is not provided", () => {
  render(<Navbar signInPath="/signin" />);
  expect(screen.getByTestId("navbar-title")).toBeEmptyDOMElement();
});

it("updates the clock with the remaining time until contest ends", async () => {
  const endAt = new Date(Date.now() + 60000).toISOString();
  render(
    <Navbar
      contest={{ title: "Sample Contest", endAt } as ContestSummaryResponseDTO}
      signInPath="/signin"
    />,
  );
  await waitFor(() => {
    expect(screen.getByTestId("navbar-clock")).not.toBeEmptyDOMElement();
  });
});

it("applies text-error class to the clock when less than 20 minutes remain", async () => {
  const endAt = new Date(Date.now() + 19 * 60 * 1000).toISOString();
  render(
    <Navbar
      contest={{ title: "Sample Contest", endAt } as ContestSummaryResponseDTO}
      signInPath="/signin"
    />,
  );
  await waitFor(() => {
    expect(screen.getByTestId("navbar-clock")).toHaveClass("text-error");
  });
});

it("renders the member name when authorization is provided", () => {
  const authorization = { member: { name: "John Doe" } };
  jest
    .spyOn(require("@/app/_util/authorization-hook"), "useAuthorization")
    .mockReturnValue(authorization);
  render(<Navbar signInPath="/signin" />);
  expect(screen.getByTestId("navbar-member")).toHaveTextContent("John Doe");
});

it("renders an guest member name when authorization is not provided", () => {
  jest
    .spyOn(require("@/app/_util/authorization-hook"), "useAuthorization")
    .mockReturnValue(null);
  render(<Navbar signInPath="/signin" />);
  expect(screen.getByTestId("navbar-member")).toHaveTextContent("guest");
});

it("calls signOut and navigates to signInPath when sign out button is clicked", () => {
  const mockPush = jest.fn();
  jest
    .spyOn(require("next/navigation"), "useRouter")
    .mockReturnValue({ push: mockPush });
  render(<Navbar signInPath="/signin" />);
  screen.getByTestId("navbar-signout").click();
  expect(mockPush).toHaveBeenCalledWith("/signin");
  expect(authorizationService.deleteAuthorization).toHaveBeenCalled();
});

it("toggles the theme when the theme toggle is clicked", () => {
  const toggleTheme = jest.fn();
  jest
    .spyOn(require("@/app/_util/theme-hook"), "useTheme")
    .mockReturnValue({ theme: "light", toggleTheme });
  render(<Navbar signInPath="/signin" />);
  screen.getByTestId("navbar-theme").click();
  expect(toggleTheme).toHaveBeenCalled();
});
