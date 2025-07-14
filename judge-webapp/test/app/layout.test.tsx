import React from "react";
import { render, screen } from "@testing-library/react";
import Layout from "@/app/layout";

jest.mock("@/app/_html", () => ({
  Html: ({
    children,
    locale,
  }: {
    children: React.ReactNode;
    locale: string;
  }) => <div lang={locale}>{children}</div>,
}));

jest.mock("@/i18n/request", () => ({
  getIntlConfig: async () => ({
    locale: "en",
    messages: {},
  }),
}));

describe("Layout", () => {
  it("renders children correctly", async () => {
    render(
      await Layout({
        children: <div data-testid="children">Test Content</div>,
      }),
    );

    expect(screen.getByTestId("children")).toBeInTheDocument();
    expect(screen.getByTestId("footer-text")).toHaveTextContent(
      "Judge 0.0.0 | by @leonfoliveira",
    );
    expect(screen.getByTestId("footer-link")).toHaveAttribute(
      "href",
      "https://github.com/leonfoliveira",
    );
  });
});
