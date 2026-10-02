import { act } from "@testing-library/react";

import { useLoadableState, useLoadableStateRoot } from "@/app/_lib/hook/useLoadableState";
import { renderHookWithProviders } from "@/test/render-with-providers";
import { MockContestResponseDTO } from "@/test/mock/response/MockDTOs";

describe("useLoadableState hook", () => {
  it("starts and finishes with values or a functional update", async () => {
    const errorHandler = { handle: jest.fn() };
    const { result } = await renderHookWithProviders(() =>
      useLoadableStateRoot<string[]>(errorHandler, { data: ["initial"] }),
    );
    await act(async () => result.current.start());
    expect(result.current).toMatchObject({ isLoading: true, data: ["initial"] });
    await act(async () => result.current.finish((current) => [...current, "added"]));
    expect(result.current).toMatchObject({ isLoading: false, data: ["initial", "added"], error: undefined });
    await act(async () => result.current.finish(["replacement"]));
    expect(result.current.data).toEqual(["replacement"]);
  });

  it("normalizes failure values and awaits the error handler", async () => {
    const errorHandler = { handle: jest.fn().mockResolvedValue(undefined) };
    const { result } = await renderHookWithProviders(() => useLoadableStateRoot(errorHandler));
    await act(async () => result.current.fail("offline"));
    expect(errorHandler.handle).toHaveBeenCalledWith(new Error("offline"), {});
    expect(result.current.error).toEqual(new Error("offline"));
    expect(result.current.isLoading).toBe(false);
  });

  it("uses the app error handler when no root handler is supplied", async () => {
    const { result } = await renderHookWithProviders(
      () => useLoadableState<number>({ data: 1 }),
      { contest: MockContestResponseDTO() },
    );
    expect(result.current.data).toBe(1);
  });
});
