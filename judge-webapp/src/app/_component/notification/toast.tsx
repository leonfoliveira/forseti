import { useEffect, useRef } from "react";
import { cls } from "@/app/_util/cls";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import {
  NotificationItemType,
  NotificationLevel,
} from "@/app/_context/notification-context";

type Props = {
  toast: NotificationItemType;
  onClose: () => void;
};

/**
 * Toast component to display small corner notifications.
 */
export function Toast({ toast, onClose }: Props) {
  const closeTimeout = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    closeTimeout.current = setTimeout(() => {
      onClose();
    }, toast.ttl);

    return () => {
      if (closeTimeout.current) {
        clearTimeout(closeTimeout.current);
      }
    };
  }, []);

  const style = {
    [NotificationLevel.INFO]: "alert-info",
    [NotificationLevel.SUCCESS]: "alert-success",
    [NotificationLevel.WARNING]: "alert-warning",
    [NotificationLevel.ERROR]: "alert-error",
  };

  return (
    <div
      className={cls("alert pointer-events-auto flex justify-between", style[toast.level])}
      style={{ pointerEvents: "auto" }}
      data-testid="toast"
    >
      {toast.text}
      <FontAwesomeIcon
        icon={faClose}
        className="ms-2 cursor-pointer"
        onClick={onClose}
        data-testid="toast-close-icon"
      />
    </div>
  );
}
