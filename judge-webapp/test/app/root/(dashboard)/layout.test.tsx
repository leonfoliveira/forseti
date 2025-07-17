import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/root/(dashboard)/layout";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { redirect } from "@/test/jest.setup";
import { routes } from "@/app/_routes";
import { useAuthorization } from "@/app/_component/context/authorization-context";

jest.mock("@/app/_component/context/authorization-context", () => ({
  useAuthorization: jest.fn(() => ({
    authorization: { member: { type: MemberType.ROOT } },
  })),
}));

jest.mock("@/app/_component/navbar");
jest.mock("@/app/root/(dashboard)/_component/root-tab-bar");

describe("RootLayout", () => {
  it("redirect to sign in if not authorized", () => {
    (useAuthorization as jest.Mock).mockReturnValue({
      authorization: undefined,
    });

    render(
      <RootLayout>
        <span />
      </RootLayout>,
    );

    expect(redirect).toHaveBeenCalledWith(routes.ROOT_SIGN_IN());
  });

  it("redirect to forbidden if not root member", () => {
    (useAuthorization as jest.Mock).mockReturnValue({
      authorization: { member: { type: MemberType.CONTESTANT } },
    });

    render(
      <RootLayout>
        <span />
      </RootLayout>,
    );

    expect(redirect).toHaveBeenCalledWith(routes.FORBIDDEN);
  });

  it("renders children when authorized as root member", () => {
    (useAuthorization as jest.Mock).mockReturnValue({
      authorization: { member: { type: MemberType.ROOT } },
    });

    render(
      <RootLayout>
        <span data-testid="child" />
      </RootLayout>,
    );

    expect(redirect).not.toHaveBeenCalled();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
