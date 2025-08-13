import { render, screen } from "@testing-library/react";

import Layout from "@/app/layout";

jest.mock("react-intl", () => ({
  IntlProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock("@/store/store-provider", () => ({
  StoreProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock("@/lib/component/footer", () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

jest.mock("@/lib/component/notification/alert-box");
jest.mock("@/lib/component/notification/toast-box");

jest.mock("@/lib/provider/authorization-provider", () => ({
  AuthorizationProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock("@/app/_util/theme-hook", () => ({
  useTheme: () => ({
    theme: "light",
  }),
}));

describe("Layout", () => {
  it("should render the layout with children and footer", async () => {
    render(
      <Layout>
        <p data-testid="child">Child</p>
      </Layout>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
