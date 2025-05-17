import { atom } from "jotai";

export enum ToastLevel {
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export type ToastType = {
  id: string;
  level: ToastLevel;
  text: string;
};

export const toastsAtom = atom<ToastType[]>([]);

export const addToastAtom = atom(
  null,
  (get, set, level: ToastLevel, text: string) => {
    const currentToasts = get(toastsAtom);
    const newToast = {
      id: crypto.randomUUID(),
      level,
      text: text,
    };
    set(toastsAtom, [...currentToasts, newToast]);
  },
);

export const removeToastAtom = atom(null, (get, set, id: string) => {
  const currentToasts = get(toastsAtom);
  set(
    toastsAtom,
    currentToasts.filter((toast) => toast.id !== id),
  );
});
