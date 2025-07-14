import { useModal } from "@/app/_util/modal-hook";
import { renderHook, waitFor } from "@testing-library/react";

describe("useModal", () => {
  it("should be able to open the modal", async () => {
    const { result } = renderHook(() => useModal<{ title: string }>());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.props).toBeUndefined();

    await waitFor(() => {
      result.current.open({ title: "Test Modal" });
    });

    await waitFor(() => {
      expect(result.current.isOpen).toBe(true);
      expect(result.current.props).toEqual({ title: "Test Modal" });
    });
  });

  it("should be able to close the modal", async () => {
    const { result } = renderHook(() => useModal<{ title: string }>());

    await waitFor(() => {
      result.current.open({ title: "Test Modal" });
    });

    await waitFor(() => {
      expect(result.current.isOpen).toBe(true);
      expect(result.current.props).toEqual({ title: "Test Modal" });
    });

    await waitFor(() => {
      result.current.close();
    });

    await waitFor(() => {
      expect(result.current.isOpen).toBe(false);
      expect(result.current.props).toBeUndefined();
    });
  });
});
