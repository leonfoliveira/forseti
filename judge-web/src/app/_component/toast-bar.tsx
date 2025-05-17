import { useAtomValue, useSetAtom } from "jotai";
import { removeToastAtom, toastsAtom } from "@/app/_atom/toast-atom";
import { Toast } from "@/app/_component/toast";

export function ToastBar() {
  const toasts = useAtomValue(toastsAtom);
  const removeToast = useSetAtom(removeToastAtom);

  return (
    <div
      className="fixed-top d-flex vh-100 flex-column-reverse align-items-end p-2 gap-1"
      style={{
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          lifetime={3000}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}
