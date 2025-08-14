import { render, screen } from "@testing-library/react";

import RootLayout from "@/app/root/(dashboard)/layout";
import { routes } from "@/config/routes";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { mockRedirect, mockUseAuthorization } from "@/test/jest.setup";

jest.mock("@/lib/component/navbar", () => ({
  Navbar: ({ signInPath }: any) => (
    <a href={signInPath} data-testid="sign-in">
      SignIn
    </a>
  ),
}));

describe("RootLayout", () => {
  it("should redirect to sign-in if not authorized", () => {
    mockUseAuthorization.mockReturnValue(undefined);

    render(
      <RootLayout>
        <p data-testid="child">Child</p>
      </RootLayout>,
    );

    expect(mockRedirect).toHaveBeenCalledWith(routes.ROOT_SIGN_IN);
  });

  it("should redirect to forbidden if member type is not ROOT", () => {
    const authorization = { member: { type: MemberType.CONTESTANT } };
    mockUseAuthorization.mockReturnValue(authorization);

    render(
      <RootLayout>
        <p data-testid="child">Child</p>
      </RootLayout>,
    );

    expect(mockRedirect).toHaveBeenCalledWith(routes.FORBIDDEN);
  });

  it("should render children if authorized as ROOT", () => {
    const authorization = { member: { type: MemberType.ROOT } };
    mockUseAuthorization.mockReturnValue(authorization);

    render(
      <RootLayout>
        <p data-testid="child">Child</p>
      </RootLayout>,
    );

    expect(screen.getByTestId("sign-in")).toHaveAttribute(
      "href",
      routes.ROOT_SIGN_IN,
    );
    expect(screen.getByTestId("link:/root/contests")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
