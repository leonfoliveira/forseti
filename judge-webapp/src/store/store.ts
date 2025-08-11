import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore } from "react-redux";

import { alertsSlice } from "./slices/alerts-slice";
import { authorizationSlice } from "./slices/authorization-slice";
import { toastsSlice } from "./slices/toasts-slice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      alerts: alertsSlice.reducer,
      toasts: toastsSlice.reducer,
      authorization: authorizationSlice.reducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
