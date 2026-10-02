import { render, screen } from "@testing-library/react";

import { LoadingPage } from "@/app/_lib/component/page/LoadingPage";

describe("LoadingPage", () => {
  it("shows the loading indicator", () => {
    render(<LoadingPage />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });
});
