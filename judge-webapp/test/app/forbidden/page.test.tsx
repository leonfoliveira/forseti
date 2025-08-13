import { render, screen } from "@testing-library/react";

import ForbiddenPage from "@/app/forbidden/page";

jest.mock("@/lib/component/page/error-page-template", () => ({
  ErrorPageTemplate: ({ code, description }: any) => (
    <>
      <p data-testid="code">{code}</p>
      <p data-testid="description">{description}</p>
    </>
  ),
}));

describe("ErrorPage", () => {
  it("renders the error page template with correct props", () => {
    render(<ForbiddenPage />);

    expect(screen.getByTestId("code")).toHaveTextContent("403");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "You do not have permission to access this page.",
    );
  });
});
