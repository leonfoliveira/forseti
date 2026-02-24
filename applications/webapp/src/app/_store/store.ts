import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore } from "react-redux";
import { combineReducers } from "redux";

import { adminDashboardSlice } from "@/app/_store/slices/admin-dashboard-slice";
import { balloonSlice } from "@/app/_store/slices/balloon-slice";
import { contestSlice } from "@/app/_store/slices/contest-slice";
import { contestantDashboardSlice } from "@/app/_store/slices/contestant-dashboard-slice";
import { guestDashboardSlice } from "@/app/_store/slices/guest-dashboard-slice";
import { judgeDashboardSlice } from "@/app/_store/slices/judge-dashboard-slice";
import { sessionSlice } from "@/app/_store/slices/session-slice";
import { staffDashboardSlice } from "@/app/_store/slices/staff-dashboard-slice";

const rootReducer = combineReducers({
  balloon: balloonSlice.reducer,
  session: sessionSlice.reducer,
  contest: contestSlice.reducer,
  adminDashboard: adminDashboardSlice.reducer,
  contestantDashboard: contestantDashboardSlice.reducer,
  guestDashboard: guestDashboardSlice.reducer,
  judgeDashboard: judgeDashboardSlice.reducer,
  staffDashboard: staffDashboardSlice.reducer,
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
