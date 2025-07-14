import { render, screen } from "@testing-library/react";
import ForbiddenPage from "@/app/forbidden/page";

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

describe("ForbiddenPage", () => {
  it("should render ErrorPageTemplate", () => {
    render(<ForbiddenPage />);

    expect(screen.getByTestId("code")).toHaveTextContent("403");
    expect(screen.getByTestId("description")).toHaveTextContent("description");
  });
});
