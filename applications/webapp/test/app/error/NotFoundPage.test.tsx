import { render, screen } from "@testing-library/react";

import { NotFoundPage } from "@/app/error/NotFoundPage";

describe("NotFoundPage", () => {
  it("shows the not-found status and explanation", () => {
    render(<NotFoundPage />);

    expect(screen.getByTestId("code")).toHaveTextContent("404");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "The page you are looking for could not be found.",
    );
  });
});
