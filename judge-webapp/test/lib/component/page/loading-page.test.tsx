import { render, screen } from "@testing-library/react";

import { LoadingPage } from "@/lib/component/page/loading-page";

describe("LoadingPage", () => {
  it("renders a loading spinner", () => {
    render(<LoadingPage />);
    const spinner = screen.getByTestId("spinner");
    expect(spinner).toBeInTheDocument();
  });
});
