import {
  faCheck,
  faCircleInfo,
  faCircleXmark,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import { FormattedMessage } from "react-intl";

import { cls } from "@/app/_util/cls";
import { AlertLevel, AlertType } from "@/store/slices/alerts-slice";

type Props = {
  className?: string;
  alert: AlertType;
  onClose: () => void;
};

/**
 * Alert component to display large centered notifications.
 */
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
      className={cls(
        "alert cursor-pointer pointer-events-auto",
        variant,
        className,
      )}
      onClick={onClose}
      data-testid="alert"
    >
      {icon}
      <FormattedMessage {...alert.text} />
    </div>
  );
}
