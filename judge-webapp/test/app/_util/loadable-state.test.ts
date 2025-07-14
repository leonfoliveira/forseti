import { useLoadableState } from "@/app/_util/loadable-state";
import { renderHook, waitFor } from "@testing-library/react";
import { ServerException } from "@/core/domain/exception/ServerException";

describe("useLoadableState", () => {
  it("should start with custom initial state", () => {
    const initialState = {
      isLoading: true,
      data: "Initial Data",
      error: new Error(),
    };
    const { result } = renderHook(() => useLoadableState(initialState));
    const state = result.current;

    expect(state.isLoading).toBe(initialState.isLoading);
    expect(state.data).toBe(initialState.data);
    expect(state.error).toBe(initialState.error);
  });

  it("should start loading state", async () => {
    const { result } = renderHook(() => useLoadableState());
    const state = result.current;

    expect(state.isLoading).toBe(false);
    expect(state.data).toBeUndefined();
    expect(state.error).toBeUndefined();

    await waitFor(() => {
      state.start();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeUndefined();
    });
  });

  it("should finish with data", async () => {
    const { result } = renderHook(() => useLoadableState());
    const state = result.current;

    await waitFor(() => {
      state.finish("Loaded Data");
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBe("Loaded Data");
      expect(result.current.error).toBeUndefined();
    });
  });

  it("should finish with a callback", async () => {
    const { result } = renderHook(() => useLoadableState({ data: "initial" }));
    const state = result.current;

    await waitFor(() => {
      state.finish((currentData: string) => `updated ${currentData}`);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBe("updated initial");
      expect(result.current.error).toBeUndefined();
    });
  });

  it("should fail with an error", async () => {
    const { result } = renderHook(() => useLoadableState());
    const state = result.current;

    const error = new Error("Test Error");
    await waitFor(() => {
      state.fail(error);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBe(error);
    });
  });

  it("should handle error with a handler", async () => {
    const { result } = renderHook(() => useLoadableState());
    const state = result.current;

    const error = new ServerException("Test Error");
    const handler = jest.fn();
    await waitFor(() => {
      state.fail(error, { [ServerException.name]: handler });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBe(error);
      expect(handler).toHaveBeenCalledWith(error);
    });
  });
});
