import { renderHook } from "@testing-library/react";
import { act } from "react";

import { useDialog } from "@/app/_lib/hook/dialog-hook";

describe("useDialog", () => {
  it("should initialize with the default open state", () => {
    const { result } = renderHook(() => useDialog(true));
    expect(result.current.isOpen).toBe(true);
  });

  it("should open the dialog", () => {
    const { result } = renderHook(() => useDialog());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });

  it("should close the dialog and reset body pointer events", () => {
    const { result } = renderHook(() => useDialog(true));
    document.body.style.pointerEvents = "none";
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
    expect(document.body.style.pointerEvents).toBe("auto");
  });
});
