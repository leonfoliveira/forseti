import { render, screen } from "@testing-library/react";

import { Footer } from "@/lib/component/footer";

describe("Footer", () => {
  it("should render the footer", () => {
    render(<Footer />);

    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
