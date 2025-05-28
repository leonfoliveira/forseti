import { Table } from "@/app/_component/table/table";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { TableSection } from "@/app/_component/table/table-section";
import { formatDateTime } from "@/app/_util/date-utils";
import React from "react";
import { useRouter } from "next/navigation";
import { ContestStatusBadge } from "@/app/root/contests/_component/contest-status-badge";
import { ContestSummaryOutputDTO } from "@/core/service/dto/output/ContestSummaryOutputDTO";

type Props = {
  contests: ContestSummaryOutputDTO[];
};

export function ContestsTable(props: Props) {
  const { contests } = props;

  const router = useRouter();

  return (
    <Table>
      <TableSection head>
        <TableRow>
          <TableCell header className="w-1/20">
            ID
          </TableCell>
          <TableCell header className="w-11/20">
            Title
          </TableCell>
          <TableCell header className="w-3/20">
            Start At
          </TableCell>
          <TableCell header className="w-3/20">
            End At
          </TableCell>
          <TableCell header className="w-2/20">
            Status
          </TableCell>
        </TableRow>
      </TableSection>
      <TableSection>
        {contests.map((contest) => (
          <TableRow
            key={contest.id}
            onClick={() => router.push(`/root/contests/${contest.id}`)}
            className="cursor-pointer hover:bg-base-200 active:bg-base-300 transition duration-100"
          >
            <TableCell>{contest.id}</TableCell>
            <TableCell>{contest.title}</TableCell>
            <TableCell>{formatDateTime(contest.startAt)}</TableCell>
            <TableCell>{formatDateTime(contest.endAt)}</TableCell>
            <TableCell>
              <ContestStatusBadge contest={contest} />
            </TableCell>
          </TableRow>
        ))}
      </TableSection>
    </Table>
  );
}
