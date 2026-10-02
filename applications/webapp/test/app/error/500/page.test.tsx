import { render, screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";

import Error500Page from "@/app/error/500/page";

describe("Error500Page", () => {
  it("shows the server error and only offers retry when a previous path exists", () => {
    jest.mocked(useSearchParams).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    } as never);
    const { rerender } = render(<Error500Page />);

    expect(screen.getByTestId("code")).toHaveTextContent("500");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "An unexpected error has occurred on the server.",
    );
    expect(screen.queryByTestId("reload")).toBeNull();

    jest.mocked(useSearchParams).mockReturnValue({
      get: jest.fn().mockReturnValue("/previous"),
    } as never);
    rerender(<Error500Page />);
    expect(screen.getByTestId("reload")).toHaveTextContent("Try again");
  });
});
