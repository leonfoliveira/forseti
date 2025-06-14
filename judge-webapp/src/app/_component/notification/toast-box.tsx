import React from "react";
import { Toast } from "@/app/_component/notification/toast";
import { NotificationItemType } from "@/app/_component/context/notification-context";

type Props = {
  items: NotificationItemType[];
  onClose: (id: string) => void;
};

export function ToastBox({ items, onClose }: Props) {
  return (
    <div className="fixed bottom-0 w-full p-2 z-30">
      <div className="max-w-xl m-l-auto flex flex-col gap-1">
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
