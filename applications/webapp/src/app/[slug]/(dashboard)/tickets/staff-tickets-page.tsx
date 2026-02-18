"use client";

import { TicketsPage } from "@/app/[slug]/(dashboard)/_common/tickets/tickets-page";
import { staffDashboardSlice } from "@/app/_store/slices/staff-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";

export function StaffTicketsPage() {
  const tickets = useAppSelector((state) => state.staffDashboard.tickets);
  const dispatch = useAppDispatch();

  return (
    <TicketsPage
      tickets={tickets}
      canCreate
      onCreate={(ticket) =>
        dispatch(staffDashboardSlice.actions.mergeTicket(ticket))
      }
      canEdit
      onEdit={(ticket) =>
        dispatch(staffDashboardSlice.actions.mergeTicket(ticket))
      }
    />
  );
}
