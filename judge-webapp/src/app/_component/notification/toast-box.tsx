import React from "react";
import { Toast } from "@/app/_component/notification/toast";
import { NotificationItemType } from "@/app/_context/notification-context";

type Props = {
  items: NotificationItemType[];
  onClose: (id: string) => void;
};

/**
 * ToastBox component to display a list of toasts at the right bottom of the page.
 */
export function ToastBox({ items, onClose }: Props) {
  return (
    <div className="fixed bottom-0 w-full p-2 z-30 pointer-events-none">
      <div className="max-w-xs ml-auto flex flex-col gap-1">
        {items.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => onClose(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
