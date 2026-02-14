import { toast } from "sonner";

import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { Message } from "@/i18n/message";
import { renderHookWithProviders } from "@/test/render-with-providers";

jest.mock("sonner", () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}));
jest.unmock("@/app/_lib/hook/toast-hook");

describe("useToast", () => {
  const testMessage: Message = {
    id: "test.message",
    defaultMessage: "Test message",
    values: { name: "Test" },
  };

  it("should show info toast with primary color", async () => {
    const { result } = await renderHookWithProviders(() => useToast());

    result.current.info(testMessage);

    expect(toast.info).toHaveBeenCalledWith(
      <FormattedMessage {...testMessage} />,
      {
        position: "bottom-center",
      },
    );
  });

  it("should show success toast with success color", async () => {
    const { result } = await renderHookWithProviders(() => useToast());

    result.current.success(testMessage);

    expect(toast.success).toHaveBeenCalledWith(
      <FormattedMessage {...testMessage} />,
      {
        position: "bottom-center",
      },
    );
  });

  it("should show warning toast with warning color", async () => {
    const { result } = await renderHookWithProviders(() => useToast());

    result.current.warning(testMessage);

    expect(toast.warning).toHaveBeenCalledWith(
      <FormattedMessage {...testMessage} />,
      {
        position: "bottom-center",
      },
    );
  });

  it("should show error toast with danger color", async () => {
    const { result } = await renderHookWithProviders(() => useToast());

    result.current.error(testMessage);

    expect(toast.error).toHaveBeenCalledWith(
      <FormattedMessage {...testMessage} />,
      {
        position: "bottom-center",
      },
    );
  });
});
