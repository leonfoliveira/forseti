import { useToast } from "@/app/_lib/hook/useToast";
import { renderHookWithProviders } from "@/test/render-with-providers";

describe("useToast hook", () => {
  it("exposes all notification methods", async () => {
    const { result } = await renderHookWithProviders(() => useToast());
    expect(result.current).toEqual(expect.objectContaining({
      info: expect.any(Function),
      success: expect.any(Function),
      warning: expect.any(Function),
      error: expect.any(Function),
    }));
  });
});
