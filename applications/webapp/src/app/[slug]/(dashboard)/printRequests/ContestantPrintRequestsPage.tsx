import { useAppSelector } from "@/app/_lib/store/Store";
import { PrintRequestsPage } from "@/app/[slug]/(dashboard)/_common/printRequests/PrintRequestsPage";

export function ContestantPrintRequestsPage() {
  const printRequests = useAppSelector(
    (state) => state.contestantDashboard.printRequests,
  );

  return <PrintRequestsPage printRequests={printRequests} />;
}
