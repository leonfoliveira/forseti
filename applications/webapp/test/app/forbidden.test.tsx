import ForbiddenPage from "@/app/forbidden";
import { usePathname, useRouter } from "@/test/jest.setup";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ForbiddenPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue("/test/current/path");
  });

  it("should call router.push with correct error route and from parameter", async () => {
    await renderWithProviders(<ForbiddenPage />);

    expect(useRouter().push).toHaveBeenCalledWith(
      `/error/403?from=${encodeURIComponent("/test/current/path")}`,
    );
  });

  it("should render without throwing errors", async () => {
    expect(() => renderWithProviders(<ForbiddenPage />)).not.toThrow();
  });
});
