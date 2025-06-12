import React from "react";
import { Alert } from "@/app/_component/notification/alert";
import { AlertType } from "@/app/_type/alert-type";

type Props = {
  items: AlertType[];
  onClose: (id: string) => void;
};

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
