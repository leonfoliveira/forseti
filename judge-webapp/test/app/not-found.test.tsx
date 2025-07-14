import { render, screen } from "@testing-library/react";
import NotFoundPage from "@/app/not-found";

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

describe("NotFoundPage", () => {
  it("should render ErrorPageTemplate", () => {
    render(<NotFoundPage />);

    expect(screen.getByTestId("code")).toHaveTextContent("404");
    expect(screen.getByTestId("description")).toHaveTextContent("description");
  });
});
