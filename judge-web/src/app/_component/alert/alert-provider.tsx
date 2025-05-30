import { Alert } from "@/app/_component/alert/alert";
import React, { createContext, useContext, useState } from "react";

export enum AlertLevel {
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export type AlertType = {
  id: string;
  level: AlertLevel;
  text: string;
  ttl: number;
};

const AlertContext = createContext({
  alerts: [] as AlertType[],
  setAlerts: (() => {}) as React.Dispatch<React.SetStateAction<AlertType[]>>,
});

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertType[]>([]);

  return (
    <>
      <AlertContext.Provider value={{ alerts, setAlerts }}>
        {children}
      </AlertContext.Provider>
      <div className="fixed top-0 w-full p-2 z-50">
        <div className="max-w-xl m-auto flex flex-col gap-1">
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              alert={alert}
              onClose={() =>
                setAlerts((alerts) => alerts.filter((it) => it.id !== alert.id))
              }
            />
          ))}
        </div>
      </div>
    </>
  );
}

export function useAlert() {
  const { setAlerts } = useContext(AlertContext);

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

  function error(text: string) {
    show(text, AlertLevel.ERROR);
  }

  return { info, success, warning, error };
}
