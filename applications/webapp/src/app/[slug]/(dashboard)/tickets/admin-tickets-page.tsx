"use client";

import { TicketsPage } from "@/app/[slug]/(dashboard)/_common/tickets/tickets-page";
import { adminDashboardSlice } from "@/app/_store/slices/dashboard/admin-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";

export function AdminTicketsPage() {
  const tickets = useAppSelector((state) => state.adminDashboard.tickets);
  const dispatch = useAppDispatch();

  return (
    <TicketsPage
      tickets={tickets}
      canCreate
      onCreate={(ticket) =>
        dispatch(adminDashboardSlice.actions.mergeTicket(ticket))
      }
      canEdit
      onEdit={(ticket) =>
        dispatch(adminDashboardSlice.actions.mergeTicket(ticket))
      }
    />
  );
}
