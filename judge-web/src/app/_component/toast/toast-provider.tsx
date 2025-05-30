import { Toast } from "@/app/_component/toast/toast";
import React, { createContext, useState } from "react";

export enum ToastLevel {
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export type ToastType = {
  id: string;
  level: ToastLevel;
  text: string;
  ttl: number;
};

const ToastContest = createContext({
  toasts: [] as ToastType[],
  setToasts: (() => {}) as React.Dispatch<React.SetStateAction<ToastType[]>>,
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  return (
    <>
      <ToastContest.Provider value={{ toasts, setToasts }}>
        {children}
      </ToastContest.Provider>
      <div className="toast toast-end">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() =>
              setToasts((toasts) => toasts.filter((it) => it.id !== toast.id))
            }
          />
        ))}
      </div>
    </>
  );
}

export function useToast() {
  const { setToasts } = React.useContext(ToastContest);

  function show(text: string, level: ToastLevel) {
    setToasts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text,
        level,
        ttl: 5000,
      },
    ]);
  }

  function info(text: string) {
    show(text, ToastLevel.INFO);
  }

  function success(text: string) {
    show(text, ToastLevel.SUCCESS);
  }

  function warning(text: string) {
    show(text, ToastLevel.WARNING);
  }

  function error(text: string) {
    show(text, ToastLevel.ERROR);
  }

  return { info, success, warning, error };
}
