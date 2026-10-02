import React from "react";
import { render, screen } from "@testing-library/react";

import Layout, { generateStaticParams } from "@/app/[slug]/layout";

jest.mock("@/app/[slug]/ContestLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="contest-layout">{children}</div>,
}));

describe("Contest layout", () => {
  it("provides a static fallback slug", () => {
    expect(generateStaticParams()).toEqual([{ slug: "_" }]);
  });

  it("delegates children to ContestLayout", () => {
    render(<Layout><span data-testid="child">Content</span></Layout>);
    expect(screen.getByTestId("contest-layout")).toContainElement(screen.getByTestId("child"));
  });
});
