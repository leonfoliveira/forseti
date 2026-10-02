import { render, screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";

import Error503Page from "@/app/error/503/page";

describe("Error503Page", () => {
  it("shows the unavailable status and conditionally offers retry", () => {
    jest.mocked(useSearchParams).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    } as never);
    const { rerender } = render(<Error503Page />);

    expect(screen.getByTestId("code")).toHaveTextContent("503");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "Service Unavailable. Please try again later.",
    );
    expect(screen.queryByTestId("reload")).toBeNull();

    jest.mocked(useSearchParams).mockReturnValue({
      get: jest.fn().mockReturnValue("/previous"),
    } as never);
    rerender(<Error503Page />);
    expect(screen.getByTestId("reload")).toHaveTextContent("Try again");
  });
});
