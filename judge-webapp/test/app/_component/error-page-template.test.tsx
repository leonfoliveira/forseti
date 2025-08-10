import { fireEvent, render, screen } from "@testing-library/react";
import { ErrorPageTemplate } from "@/app/_component/page/error-page-template";
import { mockRouter } from "@/test/jest.setup";
import { routes } from "@/config/routes";

describe("ErrorPageTemplate", () => {
  it("renders an error page template with the given code and description", () => {
    render(<ErrorPageTemplate code={404} description="Not found" />);

    const code = screen.getByTestId("code");
    expect(code).toBeInTheDocument();
    expect(code).toHaveTextContent("404");
    const description = screen.getByTestId("description");
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent("Not found");
    fireEvent.click(screen.getByTestId("home"));
    expect(mockRouter.push).toHaveBeenCalledWith(routes.HOME);
  });
});
