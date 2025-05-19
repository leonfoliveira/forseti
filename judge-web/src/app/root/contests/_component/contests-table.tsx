import { Fetcher } from "@/app/_util/fetcher-hook";
import { ContestShortResponseDTO } from "@/core/repository/dto/response/ContestShortResponseDTO";
import { formatStatus } from "@/app/_util/contest-utils";
import { Table } from "@/app/_component/table/table";
import { TableRow } from "@/app/_component/table/table-row";
import { TableHeader } from "@/app/_component/table/table-header";
import { TableCell } from "@/app/_component/table/table-cell";

type Props = {
  contestsFetcher: Fetcher<ContestShortResponseDTO[]>;
};

export function ContestsTable(props: Props) {
  const { contestsFetcher } = props;

  return (
    <Table>
      <TableRow>
        <TableHeader>ID</TableHeader>
        <TableHeader>Title</TableHeader>
        <TableHeader>Start At</TableHeader>
        <TableHeader>End At</TableHeader>
        <TableHeader>Status</TableHeader>
      </TableRow>
      {contestsFetcher.data?.map((contest) => (
        <TableRow key={contest.id}>
          <TableCell>{contest.id}</TableCell>
          <TableCell>{contest.title}</TableCell>
          <TableCell>{contest.startAt}</TableCell>
          <TableCell>{contest.endAt}</TableCell>
          <TableCell>{formatStatus(contest)}</TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
