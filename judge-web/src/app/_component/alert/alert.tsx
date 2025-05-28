import { cls } from "@/app/_util/cls";
import React, { useEffect } from "react";
import { AlertLevel, AlertType } from "@/app/_atom/alert-atom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCircleInfo,
  faCircleXmark,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  className?: string;
  alert: AlertType;
  onClose: () => void;
};

export function Alert({ className, alert, onClose }: Props) {
  const variant = {
    [AlertLevel.INFO]: "alert-info",
    [AlertLevel.SUCCESS]: "alert-success",
    [AlertLevel.WARNING]: "alert-warning",
    [AlertLevel.ERROR]: "alert-error",
  }[alert.level];

  const icon = {
    [AlertLevel.INFO]: <FontAwesomeIcon icon={faCircleInfo} />,
    [AlertLevel.SUCCESS]: <FontAwesomeIcon icon={faCheck} />,
    [AlertLevel.WARNING]: <FontAwesomeIcon icon={faTriangleExclamation} />,
    [AlertLevel.ERROR]: <FontAwesomeIcon icon={faCircleXmark} />,
  }[alert.level];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, alert.ttl);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cls("alert cursor-pointer", variant, className)}
      onClick={onClose}
    >
      {icon}
      <span>{alert.text}</span>
    </div>
  );
}
