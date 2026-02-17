import { forbidden } from "next/navigation";

import { AdminTicketsPage } from "@/app/[slug]/(dashboard)/tickets/admin-tickets-page";
import { ContestantTicketsPage } from "@/app/[slug]/(dashboard)/tickets/contestant-tickets-page";
import { JudgeTicketsPage } from "@/app/[slug]/(dashboard)/tickets/judge-tickets-page";
import { StaffTicketsPage } from "@/app/[slug]/(dashboard)/tickets/staff-tickets-page";
import { useAppSelector } from "@/app/_store/store";
import { MemberType } from "@/core/domain/enumerate/MemberType";

export default function DashboardTicketsPage() {
  const session = useAppSelector((state) => state.session);

  switch (session?.member.type) {
    case MemberType.ROOT:
    case MemberType.ADMIN:
      return <AdminTicketsPage />;
    case MemberType.STAFF:
      return <StaffTicketsPage />;
    case MemberType.JUDGE:
      return <JudgeTicketsPage />;
    case MemberType.CONTESTANT:
      return <ContestantTicketsPage />;
    default:
      forbidden();
  }
}
