import { StaffDashboardSlice } from "@/app/_lib/store/slice/dashboard/StaffDashboardSlice";
import { useAppDispatch, useAppSelector } from "@/app/_lib/store/Store";
import { PrintRequestsPage } from "@/app/[slug]/(dashboard)/_common/printRequests/PrintRequestsPage";

export function StaffPrintRequestsPage() {
  const printRequests = useAppSelector(
    (state) => state.staffDashboard.printRequests,
  );
  const dispatch = useAppDispatch();

  return (
    <PrintRequestsPage
      printRequests={printRequests}
      canUpdate
      onUpdate={(updatedPrintRequest) => {
        dispatch(
          StaffDashboardSlice.actions.mergePrintRequest(updatedPrintRequest),
        );
      }}
    />
  );
}
