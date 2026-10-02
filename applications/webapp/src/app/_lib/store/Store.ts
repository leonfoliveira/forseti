import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore } from "react-redux";
import { combineReducers } from "redux";

import { BalloonSlice } from "@/app/_lib/store/slice/BalloonSlice";
import { ContestSlice } from "@/app/_lib/store/slice/ContestSlice";
import { AdminDashboardSlice } from "@/app/_lib/store/slice/dashboard/AdminDashboardSlice";
import { ContestantDashboardSlice } from "@/app/_lib/store/slice/dashboard/ContestantDashboardSlice";
import { GuestDashboardSlice } from "@/app/_lib/store/slice/dashboard/GuestDashboardSlice";
import { JudgeDashboardSlice } from "@/app/_lib/store/slice/dashboard/JudgeDashboardSlice";
import { SessionSlice } from "@/app/_lib/store/slice/SessionSlice";

const rootReducer = combineReducers({
  balloon: BalloonSlice.reducer,
  session: SessionSlice.reducer,
  contest: ContestSlice.reducer,
  adminDashboard: AdminDashboardSlice.reducer,
  contestantDashboard: ContestantDashboardSlice.reducer,
  guestDashboard: GuestDashboardSlice.reducer,
  judgeDashboard: JudgeDashboardSlice.reducer,
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
