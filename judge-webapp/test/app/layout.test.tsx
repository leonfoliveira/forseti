import Layout from "@/app/layout";
import { render, screen } from "@testing-library/react";

jest.mock("@/i18n/request", () => ({
  getIntlConfig: jest
    .fn()
    .mockResolvedValue({ locale: "en", messages: { foo: "bar" } }),
}));

jest.mock("@/config/env", () => ({
  env: {
    VERSION: "1.0.0",
  },
}));

jest.mock("@/app/_component/html", () => ({
  Html: ({ children, locale, messages }: any) => (
    <>
      <p data-testid="locale">{locale}</p>
      <p data-testid="foo">{messages.foo}</p>
      {children}
    </>
  ),
}));

describe("Layout", () => {
  it("should render the layout with children and footer", async () => {
    render(await Layout({ children: <p data-testid="child">Child</p> }));

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByTestId("locale")).toHaveTextContent("en");
    expect(screen.getByTestId("foo")).toHaveTextContent("bar");
    expect(screen.getByTestId("footer")).toHaveTextContent("Judge 1.0.0 | by");
    expect(screen.getByTestId("github-link")).toHaveTextContent(
      "@leonfoliveira",
    );
    expect(screen.getByTestId("github-link")).toHaveAttribute(
      "href",
      "https://github.com/leonfoliveira",
    );
  });
});
