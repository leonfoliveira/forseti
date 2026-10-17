import { render, screen } from "@testing-library/react";

import { ForbiddenPage } from "@/app/error/ForbiddenPage";

describe("ForbiddenPage", () => {
  it("shows the forbidden status and explanation", () => {
    render(<ForbiddenPage />);

    expect(screen.getByTestId("code")).toHaveTextContent("403");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "You do not have permission to access this page.",
    );
  });
});
