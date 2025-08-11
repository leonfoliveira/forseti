
import { render, screen } from "@testing-library/react";

import { LoadingPage } from "@/app/_component/page/loading-page";

describe("LoadingPage", () => {
  it("renders a loading spinner", () => {
    render(<LoadingPage />);
    const spinner = screen.getByTestId("spinner");
    expect(spinner).toBeInTheDocument();
  });
});
