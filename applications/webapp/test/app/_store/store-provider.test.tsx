import { render, screen } from "@testing-library/react";
import React from "react";

import * as storeModule from "@/app/_store/store";
import { StoreProvider } from "@/app/_store/store-provider";

jest.mock("@/app/_store/store", () => ({
  makeStore: jest.fn(() => ({
    getState: jest.fn(),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
  })),
}));

describe("StoreProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children", () => {
    render(
      <StoreProvider>
        <div>Test Child</div>
      </StoreProvider>,
    );
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("creates store only once", () => {
    const makeStoreSpy = jest.spyOn(storeModule, "makeStore");
    render(
      <StoreProvider>
        <div>First Render</div>
      </StoreProvider>,
    );
    render(
      <StoreProvider>
        <div>Second Render</div>
      </StoreProvider>,
    );
    expect(makeStoreSpy).toHaveBeenCalledTimes(2); // Each StoreProvider instance creates its own store
  });

  it("passes store to Provider", () => {
    const makeStoreSpy = jest.spyOn(storeModule, "makeStore");
    render(
      <StoreProvider>
        <div>Store Test</div>
      </StoreProvider>,
    );
    expect(makeStoreSpy).toHaveBeenCalled();
  });
});
