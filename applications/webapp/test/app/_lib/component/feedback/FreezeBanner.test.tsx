import { render, screen } from "@testing-library/react";

import { FreezeBanner } from "@/app/_lib/component/feedback/FreezeBanner";

describe("FreezeBanner", () => {
  it("explains that the contest is frozen", () => {
    render(<FreezeBanner />);
    expect(screen.getByTestId("freeze-banner")).toHaveTextContent(
      "Contest Frozen",
    );
  });
});
