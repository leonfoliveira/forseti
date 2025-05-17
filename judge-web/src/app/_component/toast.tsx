import { useEffect, useRef } from "react";
import { ToastLevel, ToastType } from "@/app/_atom/toast-atom";
import { cls } from "@/app/_util/cls";

export function Toast({
  toast,
  lifetime,
  onClose,
}: {
  toast: ToastType;
  lifetime: number;
  onClose: (id: string) => void;
}) {
  const closeTimeout = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    closeTimeout.current = setTimeout(() => {
      onClose(toast.id);
    }, lifetime);

    return () => {
      if (closeTimeout.current) {
        clearTimeout(closeTimeout.current);
      }
    };
  }, [toast, lifetime, onClose]);

  const color = {
    [ToastLevel.INFO]: "",
    [ToastLevel.SUCCESS]: "text-bg-success",
    [ToastLevel.WARNING]: "text-bg-warning",
    [ToastLevel.ERROR]: "text-bg-danger",
  };

  return (
    <div
      className={cls("toast d-flex", color[toast.level])}
      style={{ pointerEvents: "auto" }}
    >
      <div className="toast-body">{toast.text}</div>
      <button
        type="button"
        className="btn-close me-2 m-auto"
        onClick={() => onClose(toast.id)}
      ></button>
    </div>
  );
}
