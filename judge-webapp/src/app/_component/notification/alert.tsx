import { cls } from "@/app/_util/cls";
import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCircleInfo,
  faCircleXmark,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import {
  NotificationItemType,
  NotificationLevel,
} from "@/app/_context/notification-context";
import { FormattedMessage } from "react-intl";

type Props = {
  className?: string;
  alert: NotificationItemType;
  onClose: () => void;
};

/**
 * Alert component to display large centered notifications.
 */
export function Alert({ className, alert, onClose }: Props) {
  const variant = {
    [NotificationLevel.INFO]: "alert-info",
    [NotificationLevel.SUCCESS]: "alert-success",
    [NotificationLevel.WARNING]: "alert-warning",
    [NotificationLevel.ERROR]: "alert-error",
  }[alert.level];

  const icon = {
    [NotificationLevel.INFO]: <FontAwesomeIcon icon={faCircleInfo} />,
    [NotificationLevel.SUCCESS]: <FontAwesomeIcon icon={faCheck} />,
    [NotificationLevel.WARNING]: (
      <FontAwesomeIcon icon={faTriangleExclamation} />
    ),
    [NotificationLevel.ERROR]: <FontAwesomeIcon icon={faCircleXmark} />,
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
        className
      )}
      onClick={onClose}
      data-testid="alert"
    >
      {icon}
      <FormattedMessage {...alert.text} />
    </div>
  );
}
