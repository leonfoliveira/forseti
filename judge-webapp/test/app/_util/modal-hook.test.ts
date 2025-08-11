import { renderHook, act } from "@testing-library/react";

import { useModal } from "@/app/_util/modal-hook";

describe("useModal", () => {
  it("initializes with closed state and undefined props", () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.props).toBeUndefined();
  });

  it("opens the modal with provided props", () => {
    const { result } = renderHook(() => useModal<{ message: string }>());
    const props = { message: "Hello" };
    act(() => result.current.open(props));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.props).toEqual(props);
  });

  it("opens the modal with undefined props when no props are provided", () => {
    const { result } = renderHook(() => useModal());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    expect(result.current.props).toBeUndefined();
  });

  it("closes the modal and resets props to undefined", () => {
    const { result } = renderHook(() => useModal<{ message: string }>());
    act(() => result.current.open({ message: "Hello" }));
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.props).toBeUndefined();
  });

  it("handles multiple open and close calls correctly", () => {
    const { result } = renderHook(() => useModal<{ message: string }>());
    act(() => result.current.open({ message: "First" }));
    act(() => result.current.close());
    act(() => result.current.open({ message: "Second" }));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.props).toEqual({ message: "Second" });
  });
});
