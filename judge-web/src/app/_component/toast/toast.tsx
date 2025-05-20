import { useEffect, useRef } from "react";
import { ToastLevel, ToastType } from "@/app/_atom/toast-atom";
import { cls } from "@/app/_util/cls";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";

type Props = {
  toast: ToastType;
  lifetime: number;
  onClose: (id: string) => void;
};

export function Toast({ toast, lifetime, onClose }: Props) {
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
  }, []);

  const style = {
    [ToastLevel.INFO]: "bg-blue-500 text-white",
    [ToastLevel.SUCCESS]: "bg-green-500 text-white",
    [ToastLevel.WARNING]: "bg-yellow-500 text-white",
    [ToastLevel.ERROR]: "bg-red-500 text-white",
  };

  return (
    <div
      className={cls(
        "py-2 px-5 rounded-md flex items-center",
        style[toast.level],
      )}
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
