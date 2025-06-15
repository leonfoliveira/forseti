import React from "react";
import { Alert } from "@/app/_component/notification/alert";
import { NotificationItemType } from "@/app/_component/context/notification-context";

type Props = {
  items: NotificationItemType[];
  onClose: (id: string) => void;
};

/**
 * AlertBox component to display a list of alerts on top of the page.
 */
export function AlertBox({ items, onClose }: Props) {
  return (
    <div className="fixed top-0 w-full p-2 z-50">
      <div className="max-w-xl m-auto flex flex-col gap-1">
        {items.map((alert) => (
          <Alert
            key={alert.id}
            alert={alert}
            onClose={() => onClose(alert.id)}
          />
        ))}
      </div>
    </div>
  );
}
