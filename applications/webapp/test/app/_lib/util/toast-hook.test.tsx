import { addToast } from "@heroui/react";

import { useToast } from "@/app/_lib/util/toast-hook";
import { Message } from "@/i18n/message";
import { renderHookWithProviders } from "@/test/render-with-providers";

jest.mock("@heroui/react", () => ({
  ...jest.requireActual("@heroui/react"),
  addToast: jest.fn(),
}));
jest.unmock("@/app/_lib/util/toast-hook");

describe("useToast", () => {
  const testMessage: Message = {
    id: "test.message",
    defaultMessage: "Test message",
    values: { name: "Test" },
  };

  it("should show info toast with primary color", async () => {
    const { result } = await renderHookWithProviders(() => useToast());

    result.current.info(testMessage);

    expect(addToast).toHaveBeenCalledWith({
      color: "primary",
      title: expect.anything(),
      shouldShowTimeoutProgress: true,
    });
  });

  it("should show success toast with success color", async () => {
    const { result } = await renderHookWithProviders(() => useToast());

    result.current.success(testMessage);

    expect(addToast).toHaveBeenCalledWith({
      color: "success",
      title: expect.anything(),
      shouldShowTimeoutProgress: true,
    });
  });

  it("should show warning toast with warning color", async () => {
    const { result } = await renderHookWithProviders(() => useToast());

    result.current.warning(testMessage);

    expect(addToast).toHaveBeenCalledWith({
      color: "warning",
      title: expect.anything(),
      shouldShowTimeoutProgress: true,
    });
  });

  it("should show error toast with danger color", async () => {
    const { result } = await renderHookWithProviders(() => useToast());

    result.current.error(testMessage);

    expect(addToast).toHaveBeenCalledWith({
      color: "danger",
      title: expect.anything(),
      shouldShowTimeoutProgress: true,
    });
  });
});
