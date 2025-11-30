import { useIntl } from "@/app/_lib/util/intl-hook";
import { Message } from "@/i18n/message";
import { renderHookWithProviders } from "@/test/render-with-providers";

describe("useIntl", () => {
  it("should format message raw without formatting", async () => {
    const { result } = await renderHookWithProviders(() => useIntl());

    const message: Message = {
      id: "app.page.page-title",
      defaultMessage: "Forseti",
      values: { name: "World" },
    };

    const formatted = result.current.formatMessageRaw(message);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe("string");
  });

  it("should format message with rich formatting", async () => {
    const { result } = await renderHookWithProviders(() => useIntl());

    const message = {
      id: "app.page.page-title",
      values: { strong: (chunks: any) => `<strong>${chunks}</strong>` },
    };

    const formatted = result.current.formatMessage(message);
    expect(formatted).toBeDefined();
  });

  it("should format date time", async () => {
    const { result } = await renderHookWithProviders(() => useIntl());

    const date = new Date("2025-01-01T10:00:00Z");
    const formatted = result.current.formatDateTime(date);

    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe("string");
  });

  it("should handle message without values", async () => {
    const { result } = await renderHookWithProviders(() => useIntl());

    const message: Message = {
      id: "app.page.page-title",
      defaultMessage: "Forseti",
    };

    const formatted = result.current.formatMessageRaw(message);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe("string");
  });
});
