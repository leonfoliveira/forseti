import { render, screen } from "@testing-library/react";
import { useSearchParams } from "react-router-dom";

import { ServerErrorPage } from "@/app/error/ServerErrorPage";

describe("ServerErrorPage", () => {
  it("shows the server error and only offers retry when a previous path exists", () => {
    jest
      .mocked(useSearchParams)
      .mockReturnValue([{ get: jest.fn().mockReturnValue(null) }] as never);
    const { rerender } = render(<ServerErrorPage />);

    expect(screen.getByTestId("code")).toHaveTextContent("500");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "An unexpected error has occurred on the server.",
    );
    expect(screen.queryByTestId("reload")).toBeNull();

    jest
      .mocked(useSearchParams)
      .mockReturnValue([
        { get: jest.fn().mockReturnValue("/previous") },
      ] as never);
    rerender(<ServerErrorPage />);
    expect(screen.getByTestId("reload")).toHaveTextContent("Try again");
  });
});
