import { PrintRequestsPage } from "@/app/[slug]/(dashboard)/_common/printRequests/PrintRequestsPage";
import { useAppDispatch, useAppSelector } from "@/app/_lib/store/Store";
import { AdminDashboardSlice } from "@/app/_lib/store/slice/dashboard/AdminDashboardSlice";

export function AdminPrintRequestsPage() {
  const printRequests = useAppSelector(
    (state) => state.adminDashboard.printRequests,
  );
  const dispatch = useAppDispatch();

  return (
    <PrintRequestsPage
      printRequests={printRequests}
      canUpdate
      onUpdate={(updatedPrintRequest) => {
        dispatch(
          AdminDashboardSlice.actions.mergePrintRequest(updatedPrintRequest),
        );
      }}
    />
  );
}
