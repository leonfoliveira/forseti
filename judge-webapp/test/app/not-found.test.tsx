import { render, screen } from "@testing-library/react";

import NotFoundPage from "@/app/not-found";

jest.mock("@/lib/component/page/error-page-template", () => ({
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
    expect(screen.getByTestId("description")).toHaveTextContent(
      "The page you are looking for could not be found.",
    );
  });
});
