import { render, screen } from "@testing-library/react";

import { DisconnectionBanner } from "@/app/_lib/component/feedback/DisconnectionBanner";

describe("DisconnectionBanner", () => {
  it("explains that live updates are unavailable", () => {
    render(<DisconnectionBanner />);
    expect(screen.getByTestId("disconnection-banner")).toHaveTextContent("Live updates are unavailable");
  });
});
