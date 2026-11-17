import { render, screen, fireEvent } from "@testing-library/react";
import { useSearchParams, useNavigate } from "react-router-dom";

import ServiceUnavailablePage from "@/app/error/ServiceUnavailablePage";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ServiceUnavailablePage", () => {
  it("shows the server unavailable error", async () => {
    (useSearchParams()[0].get as jest.Mock).mockReturnValue(null);

    await renderWithProviders(<ServiceUnavailablePage />);

    expect(screen.getByTestId("code")).toHaveTextContent("503");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "The service is currently unavailable. Please try again later.",
    );
    expect(screen.queryByTestId("reload")).not.toBeInTheDocument();
  });

  it("allows reload when a previous path exists", async () => {
    (useSearchParams()[0].get as jest.Mock).mockReturnValue("/previous");

    await renderWithProviders(<ServiceUnavailablePage />);

    expect(screen.getByTestId("reload")).toHaveTextContent("Try Again");
    fireEvent.click(screen.getByTestId("reload"));
    expect(useNavigate()).toHaveBeenCalledWith("/previous");
  });
});
