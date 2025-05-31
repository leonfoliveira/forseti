import { render } from "@testing-library/react";
import RootPage from "@/app/root/page";
import { redirect } from "next/navigation";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("RootPage", () => {
  it("redirects to /root/contests", () => {
    render(<RootPage />);
    expect(redirect).toHaveBeenCalledWith("/root/contests");
  });
});
