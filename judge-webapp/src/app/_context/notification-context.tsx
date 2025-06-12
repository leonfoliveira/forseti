import React, { createContext, useState } from "react";
import { AlertLevel, AlertType } from "@/app/_type/alert-type";
import { ToastLevel, ToastType } from "@/app/_type/toast-type";
import { AlertBox } from "@/app/_component/notification/alert-box";
import { ToastBox } from "@/app/_component/notification/toast-box";

const NotificationContext = createContext({
  alert: {
    items: [] as AlertType[],
    show: (() => {}) as (
      text: string,
      level?: AlertLevel,
      ttl?: number,
    ) => void,
    close: (() => {}) as (id: string) => void,
  },
  toast: {
    items: [] as ToastType[],
    show: (() => {}) as (
      text: string,
      level?: ToastLevel,
      ttl?: number,
    ) => void,
    close: (() => {}) as (id: string) => void,
  },
});

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [toasts, setToasts] = useState<ToastType[]>([]);

  function showAlert(
    text: string,
    level: AlertLevel = AlertLevel.INFO,
    ttl = 3000,
  ) {
    const newAlert = {
      id: crypto.randomUUID(),
      text,
      level,
      ttl,
    };
    setAlerts((prev) => [...prev, newAlert]);
  }

  function closeAlert(id: string) {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }

  function showToast(
    text: string,
    level: ToastLevel = ToastLevel.INFO,
    ttl = 5000,
  ) {
    const newToast = {
      id: crypto.randomUUID(),
      text,
      level,
      ttl,
    };
    setToasts((prev) => [...prev, newToast]);
  }

  function closeToast(id: string) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }

  return (
    <NotificationContext.Provider
      value={{
        alert: { items: alerts, show: showAlert, close: closeAlert },
        toast: { items: toasts, show: showToast, close: closeToast },
      }}
    >
      {children}
      <AlertBox items={alerts} onClose={closeAlert} />
      <ToastBox items={toasts} onClose={closeToast} />
    </NotificationContext.Provider>
  );
}
