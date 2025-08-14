import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore } from "react-redux";

import { alertsSlice } from "./slices/alerts-slice";
import { authorizationSlice } from "./slices/authorization-slice";
import { contestMetadataSlice } from "./slices/contest-metadata-slice";
import { contestantDashboardSlice } from "./slices/contestant-dashboard-slice";
import { guestDashboardSlice } from "./slices/guest-dashboard-slice";
import { judgeDashboardSlice } from "./slices/judge-dashboard-slice";
import { toastsSlice } from "./slices/toasts-slice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      alerts: alertsSlice.reducer,
      toasts: toastsSlice.reducer,
      authorization: authorizationSlice.reducer,
      contestMetadata: contestMetadataSlice.reducer,
      contestantDashboard: contestantDashboardSlice.reducer,
      guestDashboard: guestDashboardSlice.reducer,
      judgeDashboard: judgeDashboardSlice.reducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
