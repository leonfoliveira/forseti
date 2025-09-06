
import { Message } from "@/i18n/message";
import { FormattedMessage } from "@/lib/component/format/formatted-message";
import { addToast, ToastProps } from "@/lib/heroui-wrapper";

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
