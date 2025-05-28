import { useAtom } from "jotai";
import { toastsAtom } from "@/app/_atom/toast-atom";
import { Toast } from "@/app/_component/toast/toast";

export function ToastBar() {
  const [toasts, setToasts] = useAtom(toastsAtom);

  function removeToast(id: string) {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }

  return (
    <div className="toast toast-end">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
}
