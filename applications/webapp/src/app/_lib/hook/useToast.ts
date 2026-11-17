import { toast } from "sonner";
import type { ParseKeys, TOptions } from "i18next";
import { useTranslation } from "react-i18next";

/**
 * Custom hook to show toast notifications.
 */
export function useToast() {
  const { t } = useTranslation();

  function getText(id: ParseKeys, values?: TOptions) {
    if (values) {
      return t(id, values);
    }
    return t(id);
  }

  return {
    info: (id: ParseKeys, values?: TOptions) =>
      toast.info(getText(id, values), {
        position: "top-center",
        className: "!bg-blue-600 !text-white",
        testId: "toast",
        closeButton: true,
      }),
    success: (id: ParseKeys, values?: TOptions) =>
      toast.success(getText(id, values), {
        position: "top-center",
        className: "!bg-green-600 !text-white",
        testId: "toast",
        closeButton: true,
      }),
    warning: (id: ParseKeys, values?: TOptions) =>
      toast.warning(getText(id, values), {
        position: "top-center",
        className: "!bg-yellow-600 !text-white",
        testId: "toast",
        closeButton: true,
      }),
    error: (id: ParseKeys, values?: TOptions) =>
      toast.error(getText(id, values), {
        position: "top-center",
        className: "!bg-red-600 !text-white",
        testId: "toast",
        closeButton: true,
      }),
  };
}
