import { expect, Page } from "playwright/test";

import { Actor } from "@/test/actor/Actor";
import { Member } from "@/test/entity/Member";
import { PrintRequest, PrintRequestStatus } from "@/test/entity/PrintRequest";

export class ActorOnPrintRequestsPage extends Actor {
  constructor(page: Page, member: Member) {
    super(page, member);
  }

  async checkPrintRequests(printRequests: PrintRequest[]) {
    const printRequestsTable = this.page.getByTestId("print-requests-table");

    const printRequestRows =
      printRequestsTable.getByTestId("print-request-row");
    const printRequestRowsCount = await printRequestRows.count();
    expect(printRequestRowsCount).toBe(printRequests.length);

    for (let i = 0; i < printRequests.length; i++) {
      const printRequestRow = printRequestRows.nth(i);
      const printRequest = printRequests[i];
      await printRequestRow.scrollIntoViewIfNeeded();

      const timestampCell = printRequestRow.getByTestId(
        "print-request-timestamp",
      );
      const contestantCell = printRequestRow.getByTestId(
        "print-request-contestant",
      );
      const problemCell = printRequestRow.getByTestId("print-request-problem");
      const statusCell = printRequestRow.getByTestId("print-request-status");

      expect(timestampCell).not.toBeEmpty();
      expect(contestantCell).toHaveText(printRequest.submission.member.name);
      expect(problemCell).toHaveText(printRequest.submission.problem.letter);
      expect(statusCell).toHaveText(printRequest.status);
    }
  }

  async printPrintRequest(index: number) {
    const printRequestsTable = this.page.getByTestId("print-requests-table");

    const printRequestRows =
      printRequestsTable.getByTestId("print-request-row");
    const printRequestRow = printRequestRows.nth(index);
    await printRequestRow.scrollIntoViewIfNeeded();

    const printButton = printRequestRow.getByTestId(
      "print-print-request-button",
    );
    await printButton.click();
  }

  async completePrintRequest(index: number) {
    const printRequestsTable = this.page.getByTestId("print-requests-table");

    const printRequestRows =
      printRequestsTable.getByTestId("print-request-row");
    const printRequestRow = printRequestRows.nth(index);
    await printRequestRow.scrollIntoViewIfNeeded();

    const completeButton = printRequestRow.getByTestId(
      "complete-print-request-button",
    );
    await completeButton.click();

    const statusCell = printRequestRow.getByTestId("print-request-status");
    expect(statusCell).toHaveText(PrintRequestStatus.COMPLETED);
  }
}
