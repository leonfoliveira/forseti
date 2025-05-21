import { Fetcher } from "@/app/_util/fetcher-hook";
import { ContestShortResponseDTO } from "@/core/repository/dto/response/ContestShortResponseDTO";
import {
  ContestStatus,
  formatStatus,
  getContestStatus,
} from "@/app/_util/contest-utils";
import { Table } from "@/app/_component/table/table";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { TableSection } from "@/app/_component/table/table-section";
import { formatDateTime } from "@/app/_util/date-utils";
import React from "react";
import { Badge } from "@/app/_component/badge";
import { useRouter } from "next/navigation";

type Props = {
  contestsFetcher: Fetcher<ContestShortResponseDTO[]>;
};

export function ContestsTable(props: Props) {
  const { contestsFetcher } = props;

  const router = useRouter();

  function getBadgeVariant(contest: ContestShortResponseDTO) {
    const status = getContestStatus(contest);
    switch (status) {
      case ContestStatus.IN_PROGRESS:
        return "success";
      case ContestStatus.ENDED:
        return "warning";
      default:
        return "primary";
    }
  }

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
        {contestsFetcher.data?.map((contest) => (
          <TableRow
            key={contest.id}
            onClick={() => router.push(`/root/contests/${contest.id}`)}
            className="hover:bg-gray-100 active:bg-gray-200 transition cursor-pointer"
          >
            <TableCell>{contest.id}</TableCell>
            <TableCell>{contest.title}</TableCell>
            <TableCell>{formatDateTime(contest.startAt)}</TableCell>
            <TableCell>{formatDateTime(contest.endAt)}</TableCell>
            <TableCell>
              <Badge variant={getBadgeVariant(contest)}>
                {formatStatus(getContestStatus(contest))}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableSection>
    </Table>
  );
}
