import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { addToast, ToastProps } from "@/app/_lib/heroui-wrapper";
import { Message } from "@/i18n/message";

/**
 * Custom hook to show toast notifications.
 */
export function useToast() {
  function show(message: Message, color: ToastProps["color"]) {
    addToast({
      color,
      title: <FormattedMessage {...message} />,
      shouldShowTimeoutProgress: true,
    });
  }

  return {
    info: (message: Message) => show(message, "primary"),
    success: (message: Message) => show(message, "success"),
    warning: (message: Message) => show(message, "warning"),
    error: (message: Message) => show(message, "danger"),
  };
}
