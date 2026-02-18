import { expect, Page } from "playwright/test";

import { Actor } from "@/test/actor/actor";
import { Member } from "@/test/entity/member";
import { Ticket, TicketStatus } from "@/test/entity/ticket";

export class ActorOnTicketsPage extends Actor {
  constructor(page: Page, member: Member) {
    super(page, member);
  }

  async checkTickets(tickets: Ticket[]) {
    const ticketsKanban = this.page.getByTestId("tickets-kanban");
    await expect(ticketsKanban).toBeVisible();

    for (const status of Object.values(TicketStatus)) {
      const column = this.page.getByTestId(
        `ticket-column-${status.toLowerCase().replaceAll(" ", "_")}`,
      );
      await expect(column).toBeVisible();

      const statusTickets = tickets.filter(
        (ticket) => ticket.status === status,
      );
      const ticketItems = column.getByTestId("ticket-item");
      const ticketItemsCount = await ticketItems.count();
      expect(ticketItemsCount).toBe(statusTickets.length);

      for (let i = 0; i < statusTickets.length; i++) {
        const ticketItem = ticketItems.nth(i);
        const ticket = statusTickets[i];
        await ticketItem.scrollIntoViewIfNeeded();

        const memberName = ticketItem.getByTestId("ticket-member-name");
        const memberType = ticketItem.getByTestId("ticket-member-type");

        await expect(memberName).toHaveText(ticket.member.name);
        await expect(memberType).toHaveText(ticket.member.type);
      }
    }
  }

  async createTicket(ticket: Ticket) {
    const createButton = this.page.getByTestId("open-create-form-button");
    await createButton.scrollIntoViewIfNeeded();
    await createButton.click();

    const ticketForm = this.page.getByTestId("ticket-form");
    await expect(ticketForm).toBeVisible();

    const typeSelect = ticketForm.getByTestId("ticket-form-type");
    const descriptionTextarea = ticketForm.getByTestId(
      "ticket-form-description",
    );

    await typeSelect.selectOption(ticket.type);
    await descriptionTextarea.fill(ticket.description);

    const submitButton = ticketForm.getByTestId("ticket-form-submit");
    await submitButton.click();

    await expect(ticketForm).not.toBeVisible();
  }

  async moveTicket(
    index: number,
    fromStatus: TicketStatus,
    toStatus: TicketStatus,
  ) {
    const ticketsKanban = this.page.getByTestId("tickets-kanban");

    const ticketColumn = ticketsKanban.getByTestId(
      `ticket-column-${fromStatus.toLowerCase().replaceAll(" ", "_")}`,
    );
    await expect(ticketColumn).toBeVisible();

    const ticketItems = ticketColumn.getByTestId("ticket-item");
    const ticketItem = ticketItems.nth(index);
    await ticketItem.scrollIntoViewIfNeeded();

    const moveButton = ticketItem.getByTestId("move-ticket-button");
    await moveButton.click();

    const moveStatusButton = this.page.getByTestId(
      `move-ticket-button-${toStatus.toLowerCase().replaceAll(" ", "_")}`,
    );
    await moveStatusButton.click();
  }
}
