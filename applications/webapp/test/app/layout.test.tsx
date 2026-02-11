import { render } from "@testing-library/react";
import React from "react";

import Layout from "@/app/layout";

// Mock the dependencies
jest.mock("@/config/config", () => ({
  serverConfig: {
    locale: "en-US",
  },
  buildClientConfig: () => ({
    apiPublicUrl: "http://localhost:8080",
  }),
}));

jest.mock("@/app/_lib/component/layout/html", () => ({
  Html: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="html-component">{children}</div>
  ),
}));

jest.mock("next-intl", () => ({
  NextIntlClientProvider: ({
    children,
    locale,
  }: {
    children: React.ReactNode;
    locale: string;
  }) => (
    <div data-testid="next-intl-provider" data-locale={locale}>
      {children}
    </div>
  ),
}));

describe("Layout", () => {
  const TestChildren = () => (
    <div data-testid="test-children">Test Content</div>
  );

  it("should render children within NextIntlClientProvider and Html components", async () => {
    const { getByTestId } = render(
      await Layout({ children: <TestChildren /> }),
    );

    expect(getByTestId("next-intl-provider")).toBeInTheDocument();
    expect(getByTestId("html-component")).toBeInTheDocument();
    expect(getByTestId("test-children")).toBeInTheDocument();
  });

  it("should pass the correct locale to NextIntlClientProvider", async () => {
    const { getByTestId } = render(
      await Layout({ children: <TestChildren /> }),
    );

    const nextIntlProvider = getByTestId("next-intl-provider");
    expect(nextIntlProvider).toHaveAttribute("data-locale", "en-US");
  });

  it("should wrap children in the correct component hierarchy", async () => {
    const { getByTestId } = render(
      await Layout({ children: <TestChildren /> }),
    );

    const nextIntlProvider = getByTestId("next-intl-provider");
    const htmlComponent = getByTestId("html-component");
    const testChildren = getByTestId("test-children");

    // Verify the component hierarchy
    expect(nextIntlProvider).toContainElement(htmlComponent);
    expect(htmlComponent).toContainElement(testChildren);
  });

  it("should be an async function (server component)", () => {
    expect(Layout.constructor.name).toBe("AsyncFunction");
  });

  it("should accept readonly children prop", async () => {
    const children = <div>Test</div>;
    const result = await Layout({ children });
    expect(result).toBeDefined();
  });

  it("should include a script tag with client config", async () => {
    const { getByTestId } = render(
      await Layout({ children: <TestChildren /> }),
    );

    const htmlComponent = getByTestId("html-component");
    const scriptTag = htmlComponent.querySelector("script");

    expect(scriptTag).toBeInTheDocument();
    expect(scriptTag?.innerHTML).toContain(
      'globalThis.__CLIENT_CONFIG__ = {"apiPublicUrl":"http://localhost:8080"};',
    );
  });
});
