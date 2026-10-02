import { render, screen } from "@testing-library/react";

import { Footer } from "@/app/_lib/component/layout/Footer";

describe("Footer", () => {
  it("shows the application version", () => {
    render(<Footer />);
    expect(screen.getByTestId("footer-text")).toHaveTextContent(/^Forseti /);
  });
});
