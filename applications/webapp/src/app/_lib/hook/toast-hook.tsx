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
        position: "bottom-center",
        className: "!bg-blue-600 !text-white",
      }),
    success: (message: Message) =>
      toast.success(<FormattedMessage {...message} />, {
        position: "bottom-center",
        className: "!bg-green-600 !text-white",
      }),
    warning: (message: Message) =>
      toast.warning(<FormattedMessage {...message} />, {
        position: "bottom-center",
        className: "!bg-yellow-600 !text-white",
      }),
    error: (message: Message) =>
      toast.error(<FormattedMessage {...message} />, {
        position: "bottom-center",
        className: "!bg-red-600 !text-white",
      }),
  };
}
