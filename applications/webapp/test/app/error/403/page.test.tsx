import { render, screen } from "@testing-library/react";

import Error403Page from "@/app/error/403/page";

describe("Error403Page", () => {
  it("shows the forbidden status and explanation", () => {
    render(<Error403Page />);

    expect(screen.getByTestId("code")).toHaveTextContent("403");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "You do not have permission to access this page.",
    );
  });
});
