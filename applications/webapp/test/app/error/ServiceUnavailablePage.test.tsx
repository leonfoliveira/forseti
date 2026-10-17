import { render, screen } from "@testing-library/react";
import { useSearchParams } from "react-router-dom";

import { ServiceUnavailablePage } from "@/app/error/ServiceUnavailablePage";

describe("ServiceUnavailablePage", () => {
  it("shows the unavailable status and conditionally offers retry", () => {
    jest
      .mocked(useSearchParams)
      .mockReturnValue([{ get: jest.fn().mockReturnValue(null) }] as never);
    const { rerender } = render(<ServiceUnavailablePage />);

    expect(screen.getByTestId("code")).toHaveTextContent("503");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "Service Unavailable. Please try again later.",
    );
    expect(screen.queryByTestId("reload")).toBeNull();

    jest
      .mocked(useSearchParams)
      .mockReturnValue([
        { get: jest.fn().mockReturnValue("/previous") },
      ] as never);
    rerender(<ServiceUnavailablePage />);
    expect(screen.getByTestId("reload")).toHaveTextContent("Try again");
  });
});
