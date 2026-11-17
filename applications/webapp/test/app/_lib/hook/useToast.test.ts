import { useToast } from "@/app/_lib/hook/useToast";
import { renderHookWithProviders } from "@/test/render-with-providers";
import { toast } from "sonner";

jest.unmock("@/app/_lib/hook/useToast");

jest.mock("sonner", () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}));

describe("useToast hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exposes all notification methods", async () => {
    const { result } = await renderHookWithProviders(() => useToast());

    result.current.info("brand");
    result.current.success("brand");
    result.current.warning("brand");
    result.current.error("brand");

    expect(toast.info).toHaveBeenCalledWith("Forseti", expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith("Forseti", expect.any(Object));
    expect(toast.warning).toHaveBeenCalledWith("Forseti", expect.any(Object));
    expect(toast.error).toHaveBeenCalledWith("Forseti", expect.any(Object));
  });
});
