import { PrintRequestsPage } from "@/app/[slug]/(dashboard)/_common/printRequests/PrintRequestsPage";
import { useAppSelector } from "@/app/_lib/store/Store";

export function ContestantPrintRequestsPage() {
  const printRequests = useAppSelector(
    (state) => state.contestantDashboard.printRequests,
  );

  return <PrintRequestsPage printRequests={printRequests} />;
}
