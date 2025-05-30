import { renderHook, act, waitFor } from "@testing-library/react";
import { useAction } from "@/app/_util/action-hook";

it("initializes with the provided initial data", () => {
  const { result } = renderHook(() =>
    useAction(async () => "result", "initialData"),
  );
  expect(result.current.data).toBe("initialData");
  expect(result.current.isLoading).toBe(false);
  expect(result.current.error).toBeUndefined();
});

it("sets isLoading to true while the action is being performed", async () => {
  const { result } = renderHook(() => useAction(async () => "result"));
  act(() => {
    result.current.act();
  });
  await waitFor(() => {
    expect(result.current.isLoading).toBe(true);
  });
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
});

it("updates data and resets error on successful action execution", async () => {
  const mockFn = jest.fn().mockResolvedValue("success");
  const { result } = renderHook(() => useAction(mockFn));
  await act(async () => {
    await result.current.act();
  });
  expect(result.current.data).toBe("success");
  expect(result.current.error).toBeUndefined();
});

it("sets error and resets data on failed action execution", async () => {
  const mockFn = jest.fn().mockRejectedValue(new Error("failure"));
  const { result } = renderHook(() => useAction(mockFn));
  await act(async () => {
    await expect(result.current.act()).rejects.toThrow("failure");
  });
  expect(result.current.data).toBeUndefined();
  expect(result.current.error?.message).toBe("failure");
});

it("updates data using the setData function", () => {
  const { result } = renderHook(() =>
    useAction(async () => "result", "initialData"),
  );
  act(() => {
    result.current.setData((prevData) => `${prevData}-updated`);
  });
  expect(result.current.data).toBe("initialData-updated");
});
