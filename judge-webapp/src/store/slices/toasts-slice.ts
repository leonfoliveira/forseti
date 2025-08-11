import { createSlice } from "@reduxjs/toolkit";

import { Message } from "@/i18n/message";

import { useAppDispatch } from "../store";

export enum ToastLevel {
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export type ToastType = {
  id: string;
  level: ToastLevel;
  text: Message;
  ttl: number;
};

function createToast(text: Message, level: ToastLevel) {
  return {
    id: crypto.randomUUID(),
    level,
    text,
    ttl: 2000 + text.defaultMessage.length * 50,
  };
}

export const toastsSlice = createSlice({
  name: "toasts",
  initialState: [] as ToastType[],
  reducers: {
    info: (state, action: { payload: Message }) => {
      state.push(createToast(action.payload, ToastLevel.INFO));
    },
    success: (state, action: { payload: Message }) => {
      state.push(createToast(action.payload, ToastLevel.SUCCESS));
    },
    warning: (state, action: { payload: Message }) => {
      state.push(createToast(action.payload, ToastLevel.WARNING));
    },
    error: (state, action: { payload: Message }) => {
      state.push(createToast(action.payload, ToastLevel.ERROR));
    },
    close: (state, action: { payload: string }) => {
      return state.filter((toast) => toast.id !== action.payload);
    },
  },
});

export function useToast() {
  const dispatch = useAppDispatch();

  const info = (message: Message) => {
    dispatch(toastsSlice.actions.info(message));
  };

  const success = (message: Message) => {
    dispatch(toastsSlice.actions.success(message));
  };

  const warning = (message: Message) => {
    dispatch(toastsSlice.actions.warning(message));
  };

  const error = (message: Message) => {
    dispatch(toastsSlice.actions.error(message));
  };

  return {
    info,
    success,
    warning,
    error,
  };
}
