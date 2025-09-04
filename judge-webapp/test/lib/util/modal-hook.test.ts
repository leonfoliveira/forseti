import { act } from "@testing-library/react";

import { useModal } from "@/lib/util/modal-hook";
import { renderHookWithProviders } from "@/test/render-with-providers";

type TestModalProps = {
  title: string;
  message: string;
};

describe("useModal", () => {
  it("should initialize with closed state", async () => {
    const { result } = await renderHookWithProviders(() =>
      useModal<TestModalProps>(),
    );

    expect(result.current.isOpen).toBe(false);
    expect(result.current.props).toBeUndefined();
  });

  it("should open modal with props", async () => {
    const { result } = await renderHookWithProviders(() =>
      useModal<TestModalProps>(),
    );
    const testProps: TestModalProps = {
      title: "Test Title",
      message: "Test Message",
    };

    act(() => {
      result.current.open(testProps);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.props).toEqual(testProps);
  });

  it("should open modal without props", async () => {
    const { result } = await renderHookWithProviders(() =>
      useModal<TestModalProps>(),
    );

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.props).toBeUndefined();
  });

  it("should close modal", async () => {
    const { result } = await renderHookWithProviders(() =>
      useModal<TestModalProps>(),
    );
    const testProps: TestModalProps = {
      title: "Test Title",
      message: "Test Message",
    };

    // Open first
    act(() => {
      result.current.open(testProps);
    });

    expect(result.current.isOpen).toBe(true);

    // Then close
    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.props).toBeUndefined();
  });

  it("should handle multiple open/close cycles", async () => {
    const { result } = await renderHookWithProviders(() =>
      useModal<TestModalProps>(),
    );
    const firstProps: TestModalProps = {
      title: "First Title",
      message: "First Message",
    };
    const secondProps: TestModalProps = {
      title: "Second Title",
      message: "Second Message",
    };

    // First cycle
    act(() => {
      result.current.open(firstProps);
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.props).toEqual(firstProps);

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);

    // Second cycle
    act(() => {
      result.current.open(secondProps);
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.props).toEqual(secondProps);

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("should work with optional props type", async () => {
    const { result } = await renderHookWithProviders(() =>
      useModal<TestModalProps | undefined>(),
    );

    act(() => {
      result.current.open(undefined);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.props).toBeUndefined();
  });
});
