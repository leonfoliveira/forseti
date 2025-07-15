import { fireEvent, render, screen } from "@testing-library/react";
import { Navbar } from "@/app/_component/navbar";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { ContestMemberType } from "@/core/domain/enumerate/ContestMemberType";
import { useTheme } from "@/app/_util/theme-hook";
import { useAuthorization } from "@/app/_component/context/authorization-context";

jest.mock("@/app/_util/theme-hook", () => ({
  useTheme: jest.fn().mockReturnValue({
    theme: "light",
    toggleTheme: jest.fn(),
  }),
}));

jest.mock("@/app/_component/context/authorization-context", () => ({
  useAuthorization: jest.fn().mockReturnValue({
    authorization: {
      member: { name: "Test User" },
    },
  }),
}));

describe("Navbar", () => {
  it("renders the navbar with default elements", () => {
    const metadata = {
      title: "Title",
    } as unknown as ContestMetadataResponseDTO;

    render(
      <Navbar
        signInPath="/sign-in"
        contestMetadata={metadata}
        contestMemberType={ContestMemberType.CONTESTANT}
      />,
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Title");
    const theme = screen.getByTestId("theme");
    expect(theme).not.toBeChecked();
    expect(screen.getByTestId("member")).toHaveTextContent("Test User");
    const menu = screen.getByTestId("menu");
    expect(menu.children).toHaveLength(2);
    expect(menu.children[0]).toHaveTextContent(
      "contest-member-type.CONTESTANT",
    );
    expect(menu.children[1]).toHaveTextContent("sign-out:label");

    fireEvent.click(theme);
    expect(
      (useTheme as jest.Mock).mock.results[0].value.toggleTheme,
    ).toHaveBeenCalled();
  });

  it("renders the navbar with guest name when no authorization", () => {
    (useTheme as jest.Mock).mockReturnValueOnce({
      theme: "dark",
      toggleTheme: jest.fn(),
    });
    (useAuthorization as jest.Mock).mockReturnValueOnce({
      authorization: null,
    });

    render(<Navbar signInPath="/sign-in" />);

    expect(screen.getByTestId("title")).toHaveTextContent("root-title");
    expect(screen.getByTestId("theme")).toBeChecked();
    expect(screen.getByTestId("member")).toHaveTextContent("guest-name");
    const menu = screen.getByTestId("menu");
    expect(menu.children).toHaveLength(1);
    expect(menu.children[0]).toHaveTextContent("sign-in:label");
  });
});
