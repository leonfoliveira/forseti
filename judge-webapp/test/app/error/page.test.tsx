import { render, screen } from "@testing-library/react";
import ErrorPage from "@/app/error/page";

jest.mock("@/app/_component/error-page-template", () => ({
  ErrorPageTemplate: ({
    code,
    description,
  }: {
    code: number;
    description: string;
  }) => (
    <div>
      <p data-testid="code">{code}</p>
      <p data-testid="description">{description}</p>
    </div>
  ),
}));

describe("ErrorPage", () => {
  it("should render ErrorPageTemplate", () => {
    render(<ErrorPage />);

    expect(screen.getByTestId("code")).toHaveTextContent("500");
    expect(screen.getByTestId("description")).toHaveTextContent("description");
  });
});
