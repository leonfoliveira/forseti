import React from "react";

import { Alert } from "@/lib/component/notification/alert";
import { alertsSlice } from "@/store/slices/alerts-slice";
import { useAppDispatch, useAppSelector } from "@/store/store";

/**
 * AlertBox component to display a list of alerts on top of the page.
 */
export function AlertBox() {
  const alerts = useAppSelector((state) => state.alerts);
  const dispatch = useAppDispatch();

  return (
    <div className="fixed top-0 w-full p-2 z-50 pointer-events-none">
      <div className="max-w-xl m-auto flex flex-col gap-1">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            alert={alert}
            onClose={() => dispatch(alertsSlice.actions.close(alert.id))}
          />
        ))}
      </div>
    </div>
  );
}
