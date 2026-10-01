import { toast } from "sonner";

/**
 * Custom hook to show toast notifications.
 */
export function useToast() {
  return {
    info: (message: string) =>
      toast.info(message, {
        position: "top-center",
        className: "!bg-blue-600 !text-white",
        testId: "toast",
        closeButton: true,
      }),
    success: (message: string) =>
      toast.success(message, {
        position: "top-center",
        className: "!bg-green-600 !text-white",
        testId: "toast",
        closeButton: true,
      }),
    warning: (message: string) =>
      toast.warning(message, {
        position: "top-center",
        className: "!bg-yellow-600 !text-white",
        testId: "toast",
        closeButton: true,
      }),
    error: (message: string) =>
      toast.error(message, {
        position: "top-center",
        className: "!bg-red-600 !text-white",
        testId: "toast",
        closeButton: true,
      }),
  };
}
