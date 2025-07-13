import { render, screen } from "@testing-library/react";
import { AuthorizationProvider } from "@/app/_component/context/authorization-context";
import { authorizationService } from "@/app/_composition";

jest.mock("next-intl", () => ({
  useTranslations: jest.fn().mockReturnValue((key: string) => key),
}));

jest.mock("@/app/_composition", () => ({
  authorizationService: {
    getAuthorization: jest.fn(),
    setAuthorization: jest.fn(),
    deleteAuthorization: jest.fn(),
  },
}));

describe("AuthorizationContext", () => {
  it("should render content with context", () => {
    render(
      <AuthorizationProvider>
        <span data-testid="content" />
      </AuthorizationProvider>,
    );

    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(authorizationService.getAuthorization).toHaveBeenCalled();
  });

  it("should render error page on error", () => {
    (authorizationService.getAuthorization as jest.Mock).mockImplementation(
      () => {
        throw new Error();
      },
    );

    render(
      <AuthorizationProvider>
        <span data-testid="content" />
      </AuthorizationProvider>,
    );

    expect(screen.getByTestId("error-page")).toBeInTheDocument();
  });
});
