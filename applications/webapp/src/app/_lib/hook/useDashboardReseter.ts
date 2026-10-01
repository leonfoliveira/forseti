import { AdminDashboardSlice } from "@/app/_store/slice/dashboard/AdminDashboardSlice";
import { ContestantDashboardSlice } from "@/app/_store/slice/dashboard/ContestantDashboardSlice";
import { GuestDashboardSlice } from "@/app/_store/slice/dashboard/GuestDashboardSlice";
import { JudgeDashboardSlice } from "@/app/_store/slice/dashboard/JudgeDashboardSlice";
import { useAppDispatch } from "@/app/_store/Store";

/**
 * Hook for resetting all dashboard slices to their initial state.
 * This is useful when switching between different user roles or when logging out, to ensure that stale data from a previous session does not persist.
 *
 * @returns An object containing the reset function.
 */
export function useDashboardReseter() {
  const dispatch = useAppDispatch();

  function reset() {
    dispatch(AdminDashboardSlice.actions.reset());
    dispatch(ContestantDashboardSlice.actions.reset());
    dispatch(JudgeDashboardSlice.actions.reset());
    dispatch(GuestDashboardSlice.actions.reset());
  }

  return { reset };
}
