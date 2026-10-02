import React from "react";
import { render, screen } from "@testing-library/react";

import { StoreProvider } from "@/app/_lib/store/StoreProvider";
import { MockContestResponseDTO } from "@/test/mock/response/MockDTOs";

describe("StoreProvider", () => {
  it("makes its child tree available under the Redux provider", async () => {
    render(<StoreProvider preloadedState={{ contest: MockContestResponseDTO() }}>
      <span data-testid="store-child">Ready</span>
    </StoreProvider>);
    expect(screen.getByTestId("store-child")).toHaveTextContent("Ready");
  });
});
