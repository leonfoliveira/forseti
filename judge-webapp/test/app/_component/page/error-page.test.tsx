import { render, screen } from "@testing-library/react";
import { ErrorPage } from "@/app/_component/page/error-page";

describe("ErrorPage", () => {
  it("render error message and reload button", () => {
    render(<ErrorPage />);

    const errorMessage = screen.getByTestId("error");
    const reloadButton = screen.getByTestId("reload");

    expect(errorMessage).toBeInTheDocument();
    expect(reloadButton).toBeInTheDocument();
  });
});
