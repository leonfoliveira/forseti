import { useSetAtom } from "jotai";
import { ToastLevel, toastsAtom } from "@/app/_atom/toast-atom";

export type UseToastReturn = {
  info: (text: string) => void;
  success: (text: string) => void;
  warning: (text: string) => void;
  error: (text?: string) => void;
};

export function useToast(): UseToastReturn {
  const setToasts = useSetAtom(toastsAtom);

  function show(text: string, level: ToastLevel) {
    setToasts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text,
        level,
      },
    ]);
  }

  function info(text: string) {
    show(text, ToastLevel.INFO);
  }

  function success(text: string) {
    show(text || "Success", ToastLevel.SUCCESS);
  }

  function warning(text: string) {
    show(text, ToastLevel.WARNING);
  }

  function error(text?: string) {
    show(text || "Error", ToastLevel.ERROR);
  }

  return { info, success, warning, error };
}
