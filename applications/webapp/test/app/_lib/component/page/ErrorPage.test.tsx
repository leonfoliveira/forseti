import { render, screen } from "@testing-library/react";

import { ErrorPage } from "@/app/_lib/component/page/ErrorPage";

describe("ErrorPage", () => {
  it("shows a server error message and retry action", () => {
    render(<ErrorPage />);
    expect(screen.getByTestId("code")).toHaveTextContent("500");
    expect(screen.getByTestId("description")).toHaveTextContent("unexpected error");
    expect(screen.getByTestId("reload")).toHaveTextContent("Try again");
  });
});
