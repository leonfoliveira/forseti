import { useAppSelector } from "@/app/_lib/store/Store";
import { MemberType } from "@/domain/enumerate/MemberType";
import { Navigate } from "react-router-dom";
import { AdminPrintRequestsPage } from "@/app/[slug]/(dashboard)/printRequests/AdminPrintRequestsPage";
import { StaffPrintRequestsPage } from "@/app/[slug]/(dashboard)/printRequests/StaffPrintRequestsPage";
import { ContestantPrintRequestsPage } from "@/app/[slug]/(dashboard)/printRequests/ContestantPrintRequestsPage";
import { routes } from "@/config/routes";

export default function PrintRequestsPage() {
  const session = useAppSelector((state) => state.session);

  switch (session?.member.type) {
    case MemberType.ROOT:
    case MemberType.ADMIN:
      return <AdminPrintRequestsPage />;
    case MemberType.STAFF:
      return <StaffPrintRequestsPage />;
    case MemberType.CONTESTANT:
      return <ContestantPrintRequestsPage />;
    default:
      return <Navigate to={routes.FORBIDDEN} />;
  }
}
