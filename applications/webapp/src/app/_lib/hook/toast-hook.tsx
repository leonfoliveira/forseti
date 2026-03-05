import { toast } from "sonner";

import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Message } from "@/i18n/message";

/**
 * Custom hook to show toast notifications.
 */
export function useToast() {
  return {
    info: (message: Message) =>
      toast.info(<FormattedMessage {...message} />, {
        position: "top-center",
        className: "!bg-blue-600 !text-white",
        testId: "toast",
        closeButton: true,
      }),
    success: (message: Message) =>
      toast.success(<FormattedMessage {...message} />, {
        position: "top-center",
        className: "!bg-green-600 !text-white",
        testId: "toast",
        closeButton: true,
      }),
    warning: (message: Message) =>
      toast.warning(<FormattedMessage {...message} />, {
        position: "top-center",
        className: "!bg-yellow-600 !text-white",
        testId: "toast",
        closeButton: true,
      }),
    error: (message: Message) =>
      toast.error(<FormattedMessage {...message} />, {
        position: "top-center",
        className: "!bg-red-600 !text-white",
        testId: "toast",
        closeButton: true,
      }),
  };
}
