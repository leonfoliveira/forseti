import { fireEvent, render, screen } from "@testing-library/react";
import { ErrorPageTemplate } from "@/app/_component/error-page-template";
import { router } from "@/test/jest.setup";
import { routes } from "@/app/_routes";

describe("ErrorPageTemplate", () => {
  it("renders error code and description", () => {
    render(<ErrorPageTemplate code={404} description="Page not found" />);

    expect(screen.getByTestId("code")).toHaveTextContent("404");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "Page not found",
    );
    fireEvent.click(screen.getByTestId("home"));
    expect(router.push).toHaveBeenCalledWith(routes.HOME);
  });
});
