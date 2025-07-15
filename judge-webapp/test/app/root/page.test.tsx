import { render } from "@testing-library/react";
import RootPage from "@/app/root/page";
import { redirect } from "@/test/jest.setup";
import { routes } from "@/app/_routes";

describe("RootPage", () => {
  it("should redirect to the contests page", () => {
    render(<RootPage />);

    expect(redirect).toHaveBeenCalledWith(routes.ROOT_CONTESTS);
  });
});
