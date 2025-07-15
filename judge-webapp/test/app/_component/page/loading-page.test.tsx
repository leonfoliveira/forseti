import { LoadingPage } from "@/app/_component/page/loading-page";
import { render, screen } from "@testing-library/react";

describe("LoadingPage", () => {
  it("render loading", () => {
    render(<LoadingPage />);

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });
});
