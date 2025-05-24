import { useAtom } from "jotai";
import { toastsAtom } from "@/app/_atom/toast-atom";
import { Toast } from "@/app/_component/toast/toast";

export function ToastBar() {
  const [toasts, setToasts] = useAtom(toastsAtom);

  function removeToast(id: string) {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }

  return (
    <div className="fixed bottom-0 right-0 p-3 flex flex-col-reverse gap-2 z-50">
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
