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
