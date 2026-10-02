import { render, screen } from "@testing-library/react";

import Error404Page from "@/app/error/404/page";

describe("Error404Page", () => {
  it("shows the not-found status and explanation", () => {
    render(<Error404Page />);

    expect(screen.getByTestId("code")).toHaveTextContent("404");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "The page you are looking for could not be found.",
    );
  });
});
