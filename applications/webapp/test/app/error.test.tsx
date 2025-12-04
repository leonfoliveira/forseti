import ServerErrorPage from "@/app/error";
import { usePathname, useRouter } from "@/test/jest.setup";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ServerErrorPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue("/test/current/path");
  });

  it("should call router.push with correct error route and from parameter", async () => {
    await renderWithProviders(<ServerErrorPage />);

    expect(useRouter().push).toHaveBeenCalledWith(
      `/error/500?from=${encodeURIComponent("/test/current/path")}`,
    );
  });

  it("should render without throwing errors", async () => {
    expect(() => renderWithProviders(<ServerErrorPage />)).not.toThrow();
  });
});
