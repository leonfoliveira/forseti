import { renderHook, act } from "@testing-library/react";

import { useLoadableState } from "@/app/_util/loadable-state";
import { ServerException } from "@/core/domain/exception/ServerException";

describe("useLoadableState", () => {
  it("initializes with default state", () => {
    const { result } = renderHook(() => useLoadableState());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it("sets loading state when start is called", () => {
    const { result } = renderHook(() => useLoadableState());
    act(() => result.current.start());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it("sets data and stops loading when finish is called with data", () => {
    const { result } = renderHook(() => useLoadableState());
    act(() => result.current.start());
    act(() => result.current.finish("test data"));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe("test data");
    expect(result.current.error).toBeUndefined();
  });

  it("updates data using callback when finish is called with a function", () => {
    const { result } = renderHook(() => useLoadableState({ data: 5 }));
    act(() => result.current.finish((currentData) => currentData + 5));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(10);
    expect(result.current.error).toBeUndefined();
  });

  it("sets error and stops loading when fail is called with an error", () => {
    const { result } = renderHook(() => useLoadableState());
    const error = new Error("Test error");
    act(() => result.current.fail(error));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(error);
  });

  it("calls the appropriate error handler when fail is called", () => {
    const { result } = renderHook(() => useLoadableState());
    const error = new ServerException("SpecificError");
    const handlers = {
      [ServerException.name]: jest.fn(),
      default: jest.fn(),
    };
    act(() => result.current.fail(error, handlers));
    expect(handlers[ServerException.name]).toHaveBeenCalledWith(error);
    expect(handlers.default).not.toHaveBeenCalled();
  });

  it("calls the default error handler when no specific handler matches", () => {
    const { result } = renderHook(() => useLoadableState());
    const error = new Error("UnknownError");
    const handlers = {
      default: jest.fn(),
    };
    act(() => result.current.fail(error, handlers));
    expect(handlers.default).toHaveBeenCalledWith(error);
  });

  it("handles non-error objects gracefully when fail is called", () => {
    const { result } = renderHook(() => useLoadableState());
    act(() => result.current.fail("Non-error object"));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(new Error("Non-error object"));
  });
});
