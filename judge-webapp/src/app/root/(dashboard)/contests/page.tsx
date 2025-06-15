"use client";

import { redirect, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Spinner } from "@/app/_component/spinner";
import { Button } from "@/app/_component/form/button";
import { useTranslations } from "next-intl";
import { routes } from "@/app/_routes";
import { contestService } from "@/app/_composition";
import { useLoadableState } from "@/app/_util/loadable-state";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useAlert } from "@/app/_component/context/notification-context";
import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { ContestStatusBadge } from "@/app/root/(dashboard)/contests/_component/contest-status-badge";
import { Table } from "@/app/_component/table/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faPlay,
  faPlus,
  faStop,
} from "@fortawesome/free-solid-svg-icons";
import { TimestampDisplay } from "@/app/_component/timestamp-display";
import { useModal } from "@/app/_util/modal-hook";
import { DialogModal } from "@/app/_component/dialog-modal";
import { recalculateContests } from "@/app/root/(dashboard)/contests/_util/contests-calculator";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { useContestStatusWatcherBatch } from "@/app/_util/contest-status-watcher";

export default function RootContestsPage() {
  const contestsState = useLoadableState<ContestMetadataResponseDTO[]>();
  const startContestState = useLoadableState();
  const endContestState = useLoadableState();
  const contestStatuses = useContestStatusWatcherBatch(
    contestsState.data || [],
  );

  const router = useRouter();
  const alert = useAlert();
  const startModal = useModal<string>();
  const endModal = useModal<string>();
  const t = useTranslations("root.contests");

  useEffect(() => {
    async function findAllContests() {
      contestsState.start();
      try {
        const contests = await contestService.findAllContestMetadata();
        contestsState.finish(contests);
      } catch (error) {
        contestsState.fail(error, {
          [UnauthorizedException.name]: () => redirect(routes.ROOT_SIGN_IN()),
          default: () => alert.error(t("load-error")),
        });
      }
    }

    findAllContests();
  }, []);

  function onNewContest() {
    router.push(routes.ROOT_CONTESTS_NEW);
  }

  async function onStartContest(contestId: string) {
    startContestState.start();
    try {
      const contest = await contestService.forceStart(contestId);
      contestsState.finish((it) => recalculateContests(it, contest));
      alert.success(t("start-success"));
      startModal.close();
    } catch (error) {
      startContestState.fail(error, {
        [UnauthorizedException.name]: () => redirect(routes.ROOT_SIGN_IN()),
        default: () => alert.error(t("start-error")),
      });
    }
  }

  async function onEndContest(contestId: string) {
    endContestState.start();
    try {
      const contest = await contestService.forceEnd(contestId);
      contestsState.finish((it) => recalculateContests(it, contest));
      alert.success(t("end-success"));
      endModal.close();
    } catch (error) {
      endContestState.fail(error, {
        [UnauthorizedException.name]: () => redirect(routes.ROOT_SIGN_IN()),
        default: () => alert.error(t("end-error")),
      });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <p className="text-lg font-bold">{t("title")}</p>
        <Button
          type="button"
          onClick={onNewContest}
          className="btn-primary"
          data-testid="new"
        >
          <FontAwesomeIcon icon={faPlus} />
          {t("new:label")}
        </Button>
      </div>
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
            <TableCell />
          </TableRow>
        </TableSection>
        <TableSection>
          {contestsState.data?.map((contest) => (
            <TableRow
              key={contest.id}
              className="hover:bg-base-200 transition"
              data-testid="row"
            >
              <TableCell data-testid="slug">{contest.slug}</TableCell>
              <TableCell data-testid="title">{contest.title}</TableCell>
              <TableCell data-testid="startAt">
                <TimestampDisplay
                  timestamp={contest.startAt}
                  options={{ second: undefined }}
                />
              </TableCell>
              <TableCell data-testid="endAt">
                <TimestampDisplay
                  timestamp={contest.endAt}
                  options={{ second: undefined }}
                />
              </TableCell>
              <TableCell>
                <ContestStatusBadge contest={contest} data-testid="badge" />
              </TableCell>
              <TableCell>
                <fieldset className="flex gap-x-2">
                  <Button
                    type="button"
                    tooltip={t("start:tooltip")}
                    onClick={() => startModal.open(contest.id)}
                    disabled={
                      contestStatuses[contest.id] !== ContestStatus.NOT_STARTED
                    }
                    className="btn-soft"
                    data-testid="view"
                  >
                    <FontAwesomeIcon icon={faPlay} />
                  </Button>
                  <Button
                    type="button"
                    tooltip={t("end:tooltip")}
                    onClick={() => endModal.open(contest.id)}
                    disabled={
                      contestStatuses[contest.id] !== ContestStatus.IN_PROGRESS
                    }
                    className="btn-soft"
                    data-testid="view"
                  >
                    <FontAwesomeIcon icon={faStop} />
                  </Button>
                  <Button
                    type="button"
                    tooltip={t("view:tooltip")}
                    className="btn-soft"
                    onClick={() => {
                      router.push(routes.ROOT_CONTESTS_EDIT(contest.id));
                    }}
                    data-testid="view"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </Button>
                </fieldset>
              </TableCell>
            </TableRow>
          ))}
        </TableSection>
      </Table>
      {contestsState.isLoading && (
        <div className="mx-auto py-20">
          <Spinner size="lg" />
        </div>
      )}

      <DialogModal
        modal={startModal}
        onConfirm={onStartContest}
        isLoading={startContestState.isLoading}
      >
        <p>{t("start-modal:message")}</p>
      </DialogModal>

      <DialogModal
        modal={endModal}
        onConfirm={onEndContest}
        isLoading={endContestState.isLoading}
      >
        <p>{t("end-modal:message")}</p>
      </DialogModal>
    </div>
  );
}
