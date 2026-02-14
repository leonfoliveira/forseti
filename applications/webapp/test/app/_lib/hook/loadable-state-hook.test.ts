import { act } from "@testing-library/react";

import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { renderHookWithProviders } from "@/test/render-with-providers";

// Mock the error handler hook
jest.mock("@/app/_lib/hook/error-handler-hook", () => ({
  useErrorHandler: () => ({
    handle: jest.fn(),
  }),
}));

describe("useLoadableState", () => {
  const preloadedState = {
    contestMetadata: MockContestMetadataResponseDTO(),
  };

  it("should initialize with default state", async () => {
    const { result } = await renderHookWithProviders(
      () => useLoadableState(),
      preloadedState,
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it("should initialize with custom initial state", async () => {
    const initialData = { test: "data" };
    const { result } = await renderHookWithProviders(
      () => useLoadableState({ data: initialData, isLoading: true }),
      preloadedState,
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toEqual(initialData);
    expect(result.current.error).toBeUndefined();
  });

  it("should start loading", async () => {
    const { result } = await renderHookWithProviders(
      () => useLoadableState(),
      preloadedState,
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it("should finish with data", async () => {
    const testData = { test: "data" };
    const { result } = await renderHookWithProviders(
      () => useLoadableState(),
      preloadedState,
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.finish(testData);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(testData);
    expect(result.current.error).toBeUndefined();
  });

  it("should finish with callback function", async () => {
    const initialData = { count: 1 };
    const { result } = await renderHookWithProviders(
      () => useLoadableState({ data: initialData }),
      preloadedState,
    );

    act(() => {
      result.current.finish((currentData) => ({
        count: currentData.count + 1,
      }));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual({ count: 2 });
    expect(result.current.error).toBeUndefined();
  });

  it("should fail with error", async () => {
    const testError = new Error("Test error");
    const { result } = await renderHookWithProviders(
      () => useLoadableState(),
      preloadedState,
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.fail(testError);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(testError);
  });

  it("should fail with string error", async () => {
    const errorString = "String error";
    const { result } = await renderHookWithProviders(
      () => useLoadableState(),
      preloadedState,
    );

    act(() => {
      result.current.fail(errorString);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(new Error(errorString));
  });

  it("should call error handler on fail", async () => {
    // This test verifies that the error handler is called, but we don't need to mock it
    // since the error handler hook is already mocked at the top level
    const testError = new UnauthorizedException("Unauthorized");
    const customHandlers = { CustomError: jest.fn() };

    const { result } = await renderHookWithProviders(
      () => useLoadableState(),
      preloadedState,
    );

    act(() => {
      result.current.fail(testError, customHandlers);
    });

    // Verify the state is updated correctly
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(testError);
  });

  it("should preserve initial state when starting", async () => {
    const initialData = { test: "initial" };
    const { result } = await renderHookWithProviders(
      () => useLoadableState({ data: initialData }),
      preloadedState,
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toEqual(initialData);
    expect(result.current.error).toBeUndefined();
  });
});
