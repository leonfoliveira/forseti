import { useEffect, useRef } from "react";
import { ToastLevel, ToastType } from "@/app/_atom/toast-atom";
import { cls } from "@/app/_util/cls";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";

type Props = {
  toast: ToastType;
  onClose: (id: string) => void;
};

export function Toast({ toast, onClose }: Props) {
  const closeTimeout = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    closeTimeout.current = setTimeout(() => {
      onClose(toast.id);
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
      className={cls("alert", style[toast.level])}
      style={{ pointerEvents: "auto" }}
    >
      {toast.text}
      <FontAwesomeIcon
        icon={faClose}
        className="ms-2 cursor-pointer"
        onClick={() => onClose(toast.id)}
      />
    </div>
  );
}
