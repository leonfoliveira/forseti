import { render, screen } from "@testing-library/react";
import NotFoundPage from "@/app/not-found";

jest.mock("@/app/_component/error-page-template", () => ({
  ErrorPageTemplate: ({ code, description }: any) => (
    <>
      <p data-testid="code">{code}</p>
      <p data-testid="description">{description}</p>
    </>
  ),
}));

describe("NotFoundPage", () => {
  it("renders the error page template with correct props", () => {
    render(<NotFoundPage />);

    expect(screen.getByTestId("code")).toHaveTextContent("404");
    expect(screen.getByTestId("description")).toHaveTextContent("description");
  });
});
