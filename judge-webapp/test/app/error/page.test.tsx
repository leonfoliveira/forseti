import { render, screen } from "@testing-library/react";
import ErrorPage from "@/app/error/page";

jest.mock("@/app/_component/page/error-page-template", () => ({
  ErrorPageTemplate: ({ code, description }: any) => (
    <>
      <p data-testid="code">{code}</p>
      <p data-testid="description">{description}</p>
    </>
  ),
}));

describe("ErrorPage", () => {
  it("renders the error page template with correct props", () => {
    render(<ErrorPage />);

    expect(screen.getByTestId("code")).toHaveTextContent("500");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "An unexpected error occurred. Please try again."
    );
  });
});
