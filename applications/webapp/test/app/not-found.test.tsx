import NotFoundPage from "@/app/not-found";
import { usePathname, useRouter } from "@/test/jest.setup";
import { renderWithProviders } from "@/test/render-with-providers";

describe("NotFoundPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue("/test/current/path");
  });

  it("should call router.push with correct error route and from parameter", async () => {
    await renderWithProviders(<NotFoundPage />);

    expect(useRouter().push).toHaveBeenCalledWith(
      `/error/404?from=${encodeURIComponent("/test/current/path")}`,
    );
  });

  it("should render without throwing errors", async () => {
    expect(() => renderWithProviders(<NotFoundPage />)).not.toThrow();
  });
});
