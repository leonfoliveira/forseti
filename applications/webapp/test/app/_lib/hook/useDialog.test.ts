import { act } from "@testing-library/react";

import { useDialog } from "@/app/_lib/hook/useDialog";
import { renderHookWithProviders } from "@/test/render-with-providers";

describe("useDialog hook", () => {
  it("opens and closes the dialog, restoring body pointer events", async () => {
    const { result } = await renderHookWithProviders(() => useDialog());
    expect(result.current.isOpen).toBe(false);
    await act(async () => result.current.open());
    expect(result.current.isOpen).toBe(true);
    document.body.style.pointerEvents = "none";
    await act(async () => result.current.close());
    expect(result.current.isOpen).toBe(false);
    expect(document.body.style.pointerEvents).toBe("auto");
  });

  it("accepts an initially open state", async () => {
    const { result } = await renderHookWithProviders(() => useDialog(true));
    expect(result.current.isOpen).toBe(true);
  });
});
