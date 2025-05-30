import { renderHook, act } from "@testing-library/react";
import { useModal } from "@/app/_util/modal-hook";

it("returns false for isOpen initially", () => {
  const { result } = renderHook(() => useModal());
  expect(result.current.isOpen).toBe(false);
});

it("sets isOpen to true when open is called", () => {
  const { result } = renderHook(() => useModal());
  act(() => {
    result.current.open();
  });
  expect(result.current.isOpen).toBe(true);
});

it("sets isOpen to false when close is called after being opened", () => {
  const { result } = renderHook(() => useModal());
  act(() => {
    result.current.open();
    result.current.close();
  });
  expect(result.current.isOpen).toBe(false);
});

it("does not throw errors when close is called without opening", () => {
  const { result } = renderHook(() => useModal());
  act(() => {
    result.current.close();
  });
  expect(result.current.isOpen).toBe(false);
});
