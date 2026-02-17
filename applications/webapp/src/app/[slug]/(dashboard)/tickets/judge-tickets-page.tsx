"use client";

import { TicketsPage } from "@/app/[slug]/(dashboard)/_common/tickets/tickets-page";
import { judgeDashboardSlice } from "@/app/_store/slices/judge-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";

export function JudgeTicketsPage() {
  const tickets = useAppSelector((state) => state.judgeDashboard.memberTickets);
  const dispatch = useAppDispatch();

  return (
    <TicketsPage
      tickets={tickets}
      canCreate
      onCreate={(ticket) =>
        dispatch(judgeDashboardSlice.actions.mergeMemberTicket(ticket))
      }
    />
  );
}
