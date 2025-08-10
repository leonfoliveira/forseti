import { Footer } from "@/app/_component/footer";
import { render, screen } from "@testing-library/react";

describe("Footer", () => {
  it("should render the footer", () => {
    render(<Footer />);

    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
