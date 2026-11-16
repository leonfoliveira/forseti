import { render, screen, fireEvent } from "@testing-library/react";
import { useNavigate, useSearchParams } from "react-router-dom";

import ServerErrorPage from "@/app/error/ServerErrorPage";

describe("ServerErrorPage", () => {
  it("shows the server error", () => {
    (useSearchParams()[0].get as jest.Mock).mockReturnValue(null);

    render(<ServerErrorPage />);

    expect(screen.getByTestId("code")).toHaveTextContent("500");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "An unexpected error has occurred on the server.",
    );
    expect(screen.queryByTestId("reload")).not.toBeInTheDocument();
  });

  it("allows reload when a previous path exists", () => {
    (useSearchParams()[0].get as jest.Mock).mockReturnValue("/previous");

    render(<ServerErrorPage />);

    expect(screen.getByTestId("reload")).toHaveTextContent("Try again");
    fireEvent.click(screen.getByTestId("reload"));
    expect(useNavigate()).toHaveBeenCalledWith("/previous");
  });
});
