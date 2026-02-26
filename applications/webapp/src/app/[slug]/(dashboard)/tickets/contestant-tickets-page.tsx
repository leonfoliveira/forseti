"use client";

import { TicketsPage } from "@/app/[slug]/(dashboard)/_common/tickets/tickets-page";
import { contestantDashboardSlice } from "@/app/_store/slices/dashboard/contestant-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";

export function ContestantTicketsPage() {
  const tickets = useAppSelector(
    (state) => state.contestantDashboard.memberTickets,
  );
  const dispatch = useAppDispatch();

  return (
    <TicketsPage
      tickets={tickets}
      canCreate
      onCreate={(ticket) =>
        dispatch(contestantDashboardSlice.actions.mergeMemberTicket(ticket))
      }
    />
  );
}
