import React from "react";
import { Toast } from "@/app/_component/notification/toast";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { toastsSlice } from "@/store/slices/toasts-slice";

/**
 * ToastBox component to display a list of toasts at the right bottom of the page.
 */
export function ToastBox() {
  const toasts = useAppSelector((state) => state.toasts);
  const dispatch = useAppDispatch();

  return (
    <div className="fixed bottom-0 w-full p-2 z-30 pointer-events-none">
      <div className="max-w-xs ml-auto flex flex-col gap-1">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => dispatch(toastsSlice.actions.close(toast.id))}
          />
        ))}
      </div>
    </div>
  );
}
