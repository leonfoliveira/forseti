import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef } from "react";
import { FormattedMessage } from "react-intl";

import { cls } from "@/lib/util/cls";
import { ToastLevel, ToastType } from "@/store/slices/toasts-slice";

type Props = {
  toast: ToastType;
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
    [ToastLevel.INFO]: "alert-info",
    [ToastLevel.SUCCESS]: "alert-success",
    [ToastLevel.WARNING]: "alert-warning",
    [ToastLevel.ERROR]: "alert-error",
  };

  return (
    <div
      className={cls(
        "alert pointer-events-auto flex justify-between",
        style[toast.level],
      )}
      style={{ pointerEvents: "auto" }}
      data-testid="toast"
    >
      <FormattedMessage {...toast.text} />
      <FontAwesomeIcon
        icon={faClose}
        className="ms-2 cursor-pointer"
        onClick={onClose}
        data-testid="toast-close-icon"
      />
    </div>
  );
}
