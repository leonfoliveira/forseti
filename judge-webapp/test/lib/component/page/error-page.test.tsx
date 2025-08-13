import { render, screen } from "@testing-library/react";

import { ErrorPage } from "@/lib/component/page/error-page";

describe("ErrorPage", () => {
  it("renders an error message and a reload button", () => {
    render(<ErrorPage />);
    const errorPage = screen.getByTestId("error-page");
    expect(errorPage).toBeInTheDocument();
    const errorText = screen.getByTestId("error");
    expect(errorText).toBeInTheDocument();
    const reloadButton = screen.getByTestId("reload");
    expect(reloadButton).toBeInTheDocument();
  });
});
