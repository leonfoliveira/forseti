import { render, screen } from "@testing-library/react";
import { Html } from "@/app/_component/html";

jest.mock("@/app/_util/theme-hook", () => ({
  useTheme: () => ({ theme: "light" }),
}));

jest.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/app/_context/authorization-context", () => ({
  AuthorizationProvider: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/app/_context/notification-context", () => ({
  NotificationProvider: ({ children }: any) => <div>{children}</div>,
}));

describe("Html", () => {
  it("renders the html component with the given children", () => {
    render(
      <Html locale="en" messages={{}}>
        <div data-testid="child">My html</div>
      </Html>,
    );
    expect(document.documentElement).toHaveAttribute("lang", "en");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
