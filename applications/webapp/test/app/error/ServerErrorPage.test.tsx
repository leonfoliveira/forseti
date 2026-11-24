import { fireEvent,screen } from "@testing-library/react";
import { useNavigate, useSearchParams } from "react-router-dom";

import ServerErrorPage from "@/app/error/ServerErrorPage";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ServerErrorPage", () => {
  it("shows the server error", async () => {
    (useSearchParams()[0].get as jest.Mock).mockReturnValue(null);

    await renderWithProviders(<ServerErrorPage />);

    expect(screen.getByTestId("code")).toHaveTextContent("500");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "An unexpected server error occurred.",
    );
    expect(screen.queryByTestId("reload")).not.toBeInTheDocument();
  });

  it("allows reload when a previous path exists", async () => {
    (useSearchParams()[0].get as jest.Mock).mockReturnValue("/previous");

    await renderWithProviders(<ServerErrorPage />);

    expect(screen.getByTestId("reload")).toHaveTextContent("Try Again");
    fireEvent.click(screen.getByTestId("reload"));
    expect(useNavigate()).toHaveBeenCalledWith("/previous");
  });
});
