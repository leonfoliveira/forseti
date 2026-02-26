import { adminDashboardSlice } from "@/app/_store/slices/dashboard/admin-dashboard-slice";
import { contestantDashboardSlice } from "@/app/_store/slices/dashboard/contestant-dashboard-slice";
import { guestDashboardSlice } from "@/app/_store/slices/dashboard/guest-dashboard-slice";
import { judgeDashboardSlice } from "@/app/_store/slices/dashboard/judge-dashboard-slice";
import { staffDashboardSlice } from "@/app/_store/slices/dashboard/staff-dashboard-slice";
import { useAppDispatch } from "@/app/_store/store";

/**
 * Hook for resetting all dashboard slices to their initial state.
 * This is useful when switching between different user roles or when logging out, to ensure that stale data from a previous session does not persist.
 *
 * @returns An object containing the reset function.
 */
export function useDashboardReseter() {
  const dispatch = useAppDispatch();

  function reset() {
    dispatch(adminDashboardSlice.actions.reset());
    dispatch(contestantDashboardSlice.actions.reset());
    dispatch(judgeDashboardSlice.actions.reset());
    dispatch(guestDashboardSlice.actions.reset());
    dispatch(staffDashboardSlice.actions.reset());
  }

  return { reset };
}
