import React from "react";
import { render, screen } from "@testing-library/react";

import { Html } from "@/app/_lib/component/layout/Html";

jest.mock("next/font/google", () => ({
  Roboto: () => ({ className: "mock-roboto" }),
}));
jest.mock("@/app/_lib/component/shadcn/sonner", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

describe("Html", () => {
  it("wraps application content in the document providers", () => {
    render(<Html><main data-testid="content">App body</main></Html>);
    expect(screen.getByTestId("content")).toHaveTextContent("App body");
    expect(screen.getByTestId("toaster")).toBeInTheDocument();
  });
});
