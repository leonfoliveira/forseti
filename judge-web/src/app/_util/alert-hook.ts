import { useSetAtom } from "jotai";
import { alertAtom, AlertLevel } from "@/app/_atom/alert-atom";

export type UseAlertReturn = {
  info: (text: string) => void;
  success: (text: string) => void;
  warning: (text: string) => void;
  error: (text?: string) => void;
};

export function useAlert(): UseAlertReturn {
  const setAlerts = useSetAtom(alertAtom);

  function show(text: string, level: AlertLevel) {
    const newAlert = {
      id: crypto.randomUUID(),
      text,
      level,
      ttl: 3000,
    };

    setAlerts((prev) => [...prev, newAlert]);
  }

  function info(text: string) {
    show(text, AlertLevel.INFO);
  }

  function success(text: string) {
    show(text || "Success", AlertLevel.SUCCESS);
  }

  function warning(text: string) {
    show(text, AlertLevel.WARNING);
  }

  function error(text?: string) {
    show(text || "Error", AlertLevel.ERROR);
  }

  return { info, success, warning, error };
}
