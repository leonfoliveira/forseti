import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { ErrorPage } from "@/lib/component/page/error-page";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ErrorPage", () => {
  it("should render content correctly", async () => {
    await renderWithProviders(<ErrorPage />);

    expect(screen.getByTestId("code")).toHaveTextContent("500");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "An unexpected error has occurred.",
    );
    const button = screen.getByTestId("reload");
    expect(button).toBeInTheDocument();
    await act(async () => fireEvent.click(button));
    expect(window.location.pathname).toBe("/");
  });
});
