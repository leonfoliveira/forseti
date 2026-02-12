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
      }),
    success: (message: Message) =>
      toast.success(<FormattedMessage {...message} />, {
        position: "bottom-center",
      }),
    warning: (message: Message) =>
      toast.warning(<FormattedMessage {...message} />, {
        position: "bottom-center",
      }),
    error: (message: Message) =>
      toast.error(<FormattedMessage {...message} />, {
        position: "bottom-center",
      }),
  };
}
