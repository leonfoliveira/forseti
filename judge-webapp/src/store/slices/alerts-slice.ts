import { Message } from "@/i18n/message";
import { createSlice } from "@reduxjs/toolkit";
import { useAppDispatch } from "../store";

export enum AlertLevel {
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export type AlertType = {
  id: string;
  level: AlertLevel;
  text: Message;
  ttl: number;
};

function createAlert(text: Message, level: AlertLevel) {
  return {
    id: crypto.randomUUID(),
    level,
    text,
    ttl: 2000 + text.defaultMessage.length * 50,
  };
}

export const alertsSlice = createSlice({
  name: "alerts",
  initialState: [] as AlertType[],
  reducers: {
    info: (state, action: { payload: Message }) => {
      state.push(createAlert(action.payload, AlertLevel.INFO));
    },
    success: (state, action: { payload: Message }) => {
      state.push(createAlert(action.payload, AlertLevel.SUCCESS));
    },
    warning: (state, action: { payload: Message }) => {
      state.push(createAlert(action.payload, AlertLevel.WARNING));
    },
    error: (state, action: { payload: Message }) => {
      state.push(createAlert(action.payload, AlertLevel.ERROR));
    },
    close: (state, action: { payload: string }) => {
      return state.filter((alert) => alert.id !== action.payload);
    },
  },
});

export function useAlert() {
  const dispatch = useAppDispatch();

  const info = (message: Message) => {
    dispatch(alertsSlice.actions.info(message));
  };

  const success = (message: Message) => {
    dispatch(alertsSlice.actions.success(message));
  };

  const warning = (message: Message) => {
    dispatch(alertsSlice.actions.warning(message));
  };

  const error = (message: Message) => {
    dispatch(alertsSlice.actions.error(message));
  };

  return {
    info,
    success,
    warning,
    error,
  };
}
