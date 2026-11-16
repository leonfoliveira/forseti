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

    result.current.info("info");
    result.current.success("success");
    result.current.warning("warning");
    result.current.error("error");

    expect(toast.info).toHaveBeenCalledWith("info", expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith("success", expect.any(Object));
    expect(toast.warning).toHaveBeenCalledWith("warning", expect.any(Object));
    expect(toast.error).toHaveBeenCalledWith("error", expect.any(Object));
  });
});
