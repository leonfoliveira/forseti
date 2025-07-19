import { render } from "@testing-library/react";
import RootPage from "@/app/root/page";
import { mockRedirect } from "@/test/jest.setup";
import { routes } from "@/config/routes";

describe("RootPage", () => {
  it("should redirect to the contests page", () => {
    render(<RootPage />);

    expect(mockRedirect).toHaveBeenCalledWith(routes.ROOT_CONTESTS);
  });
});
