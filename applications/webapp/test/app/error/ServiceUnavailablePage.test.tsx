import { render, screen, fireEvent } from "@testing-library/react";
import { useSearchParams, useNavigate } from "react-router-dom";

import ServiceUnavailablePage from "@/app/error/ServiceUnavailablePage";

describe("ServiceUnavailablePage", () => {
  it("shows the server unavailable error", () => {
    (useSearchParams()[0].get as jest.Mock).mockReturnValue(null);

    render(<ServiceUnavailablePage />);

    expect(screen.getByTestId("code")).toHaveTextContent("503");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "Service Unavailable. Please try again later.",
    );
    expect(screen.queryByTestId("reload")).not.toBeInTheDocument();
  });

  it("allows reload when a previous path exists", () => {
    (useSearchParams()[0].get as jest.Mock).mockReturnValue("/previous");

    render(<ServiceUnavailablePage />);

    expect(screen.getByTestId("reload")).toHaveTextContent("Try again");
    fireEvent.click(screen.getByTestId("reload"));
    expect(useNavigate()).toHaveBeenCalledWith("/previous");
  });
});
