import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore } from "react-redux";
import { combineReducers } from "redux";

import { adminDashboardSlice } from "@/store/slices/admin-dashboard-slice";
import { contestMetadataSlice } from "@/store/slices/contest-metadata-slice";
import { contestantDashboardSlice } from "@/store/slices/contestant-dashboard-slice";
import { guestDashboardSlice } from "@/store/slices/guest-dashboard-slice";
import { judgeDashboardSlice } from "@/store/slices/judge-dashboard-slice";
import { sessionSlice } from "@/store/slices/session-slice";

const rootReducer = combineReducers({
  session: sessionSlice.reducer,
  contestMetadata: contestMetadataSlice.reducer,
  contestantDashboard: contestantDashboardSlice.reducer,
  guestDashboard: guestDashboardSlice.reducer,
  judgeDashboard: judgeDashboardSlice.reducer,
  adminDashboard: adminDashboardSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
