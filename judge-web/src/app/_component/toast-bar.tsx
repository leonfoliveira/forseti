import { useAtom } from "jotai";
import { toastsAtom } from "@/app/_atom/toast-atom";
import { Toast } from "@/app/_component/toast";

export function ToastBar() {
  const [toasts, setToasts] = useAtom(toastsAtom);

  function removeToast(id: string) {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }

  return (
    <div>
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
