import { Table } from "@/app/_component/table/table";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { TableSection } from "@/app/_component/table/table-section";
import { formatDateTime } from "@/app/_util/date-utils";
import React from "react";
import { useRouter } from "next/navigation";
import { ContestStatusBadge } from "@/app/root/contests/_component/contest-status-badge";
import { useTranslations } from "next-intl";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/ContestMetadataResponseDTO";
import { WithStatus } from "@/core/service/dto/output/ContestWithStatus";

type Props = {
  contests: WithStatus<ContestMetadataResponseDTO>[];
};

export function ContestsTable(props: Props) {
  const { contests } = props;
  const t = useTranslations("root.contests._component.contests-table");

  const router = useRouter();

  return (
    <Table>
      <TableSection head>
        <TableRow>
          <TableCell header className="w-1/20">
            {t("header-slug")}
          </TableCell>
          <TableCell header className="w-11/20">
            {t("header-title")}
          </TableCell>
          <TableCell header className="w-3/20">
            {t("header-start-at")}
          </TableCell>
          <TableCell header className="w-3/20">
            {t("header-end-at")}
          </TableCell>
          <TableCell header className="w-2/20">
            {t("header-status")}
          </TableCell>
        </TableRow>
      </TableSection>
      <TableSection>
        {contests.map((contest) => (
          <TableRow
            key={contest.id}
            onClick={() => router.push(`/root/contests/${contest.id}`)}
            className="cursor-pointer hover:bg-base-200 active:bg-base-300 transition duration-100"
            data-testid="row"
          >
            <TableCell data-testid="slug">{contest.slug}</TableCell>
            <TableCell data-testid="title">{contest.title}</TableCell>
            <TableCell data-testid="startAt">
              {formatDateTime(contest.startAt)}
            </TableCell>
            <TableCell data-testid="endAt">
              {formatDateTime(contest.endAt)}
            </TableCell>
            <TableCell>
              <ContestStatusBadge contest={contest} data-testid="badge" />
            </TableCell>
          </TableRow>
        ))}
      </TableSection>
    </Table>
  );
}
