import { Page } from "@/app/_lib/component/page/Page";
import { Card, CardContent } from "@/app/_lib/component/shadcn/card";
import { Table, TableBody, TableCell } from "@/app/_lib/component/shadcn/table";
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_lib/component/shadcn/table";
import { EnumeratedTextUtil } from "@/app/_lib/util/EnumeratedTextUtil";
import { PrintRequestResponseDTO } from "@/port/dto/response/printRequest/PrintRequestResponseDTO";
import { ArrowUp10Icon } from "lucide-react";
import { PrintRequestsPageActions } from "@/app/[slug]/(dashboard)/_common/printRequests/PrintRequestsPageActions";

type Props = {
  printRequests: PrintRequestResponseDTO[];
} & (
  | {
      canUpdate: true;
      onUpdate: (printRequest: PrintRequestResponseDTO) => void;
    }
  | {
      canUpdate?: false;
      onUpdate?: (printRequest: PrintRequestResponseDTO) => void;
    }
);

export function PrintRequestsPage({
  printRequests,
  canUpdate,
  onUpdate,
}: Props) {
  return (
    <Page
      title="Forseti - Print Requests"
      description="View and manage print requests."
    >
      <Card className="w-full">
        <CardContent>
          <Table className="border-b" data-testid="print-requests-table">
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>
                  Timestamp
                  <ArrowUp10Icon size={16} className="ml-1 inline" />
                </TableHead>
                <TableHead>Contestant</TableHead>
                <TableHead>Problem</TableHead>
                <TableHead>Status</TableHead>
                {canUpdate && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {printRequests
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .map((printRequest) => (
                  <TableRow
                    key={printRequest.id}
                    data-testid="print-request-row"
                  >
                    <TableCell data-testid="print-request-timestamp">
                      {printRequest.createdAt}
                    </TableCell>
                    <TableCell data-testid="print-request-contestant">
                      {printRequest.submission.member.name}
                    </TableCell>
                    <TableCell data-testid="print-request-problem">
                      {printRequest.submission.problem.letter}
                    </TableCell>
                    <TableCell data-testid="print-request-status">
                      {EnumeratedTextUtil.getPrintRequestStatus(
                        printRequest.status,
                      )}
                    </TableCell>
                    {canUpdate && (
                      <PrintRequestsPageActions
                        printRequest={printRequest}
                        onUpdate={onUpdate}
                        data-testid="print-request-actions"
                      />
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Page>
  );
}
