"use client";

import {
  faChevronRight,
  faPlay,
  faPlus,
  faStop,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { defineMessages, FormattedMessage } from "react-intl";

import { Button } from "@/app/_component/form/button";
import { FormattedDateTime } from "@/app/_component/format/formatted-datetime";
import { DialogModal } from "@/app/_component/modal/dialog-modal";
import { Spinner } from "@/app/_component/spinner";
import { Table } from "@/app/_component/table/table";
import { TableCell } from "@/app/_component/table/table-cell";
import { TableRow } from "@/app/_component/table/table-row";
import { TableSection } from "@/app/_component/table/table-section";
import { useContestStatusWatcherBatch } from "@/app/_util/contest-status-watcher";
import { useLoadableState } from "@/app/_util/loadable-state";
import { useModal } from "@/app/_util/modal-hook";
import { ContestStatusBadge } from "@/app/root/(dashboard)/contests/_component/contest-status-badge";
import { recalculateContests } from "@/app/root/(dashboard)/contests/_util/contests-calculator";
import { contestService } from "@/config/composition";
import { routes } from "@/config/routes";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { useAlert } from "@/store/slices/alerts-slice";


const messages = defineMessages({
  loadError: {
    id: "app.root.(dashboard).contests.page.load-error",
    defaultMessage: "Failed to load contests",
  },
  startSuccess: {
    id: "app.root.(dashboard).contests.page.start-success",
    defaultMessage: "Contest started successfully",
  },
  startError: {
    id: "app.root.(dashboard).contests.page.start-error",
    defaultMessage: "Failed to start contest",
  },
  endSuccess: {
    id: "app.root.(dashboard).contests.page.end-success",
    defaultMessage: "Contest ended successfully",
  },
  endError: {
    id: "app.root.(dashboard).contests.page.end-error",
    defaultMessage: "Failed to end contest",
  },
  title: {
    id: "app.root.(dashboard).contests.page.title",
    defaultMessage: "Contests",
  },
  new: {
    id: "app.root.(dashboard).contests.page.new",
    defaultMessage: "New Contest",
  },
  headerSlug: {
    id: "app.root.(dashboard).contests.page.header-slug",
    defaultMessage: "Slug",
  },
  headerTitle: {
    id: "app.root.(dashboard).contests.page.header-title",
    defaultMessage: "Title",
  },
  headerStartAt: {
    id: "app.root.(dashboard).contests.page.header-start-at",
    defaultMessage: "Start At",
  },
  headerEndAt: {
    id: "app.root.(dashboard).contests.page.header-end-at",
    defaultMessage: "End At",
  },
  headerStatus: {
    id: "app.root.(dashboard).contests.page.header-status",
    defaultMessage: "Status",
  },
  startTooltip: {
    id: "app.root.(dashboard).contests.page.start-tooltip",
    defaultMessage: "Force start",
  },
  endTooltip: {
    id: "app.root.(dashboard).contests.page.end-tooltip",
    defaultMessage: "Force end",
  },
  viewTooltip: {
    id: "app.root.(dashboard).contests.page.view-tooltip",
    defaultMessage: "View Contest",
  },
  startConfirm: {
    id: "app.root.(dashboard).contests.page.start-confirm",
    defaultMessage: "Are you sure you want to start this contest now?",
  },
  endConfirm: {
    id: "app.root.(dashboard).contests.page.end-confirm",
    defaultMessage: "Are you sure you want to end this contest now?",
  },
});

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

  useEffect(() => {
    async function findAllContests() {
      contestsState.start();
      try {
        const contests = await contestService.findAllContestMetadata();
        contestsState.finish(contests);
      } catch (error) {
        contestsState.fail(error, {
          default: () => alert.error(messages.loadError),
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
      alert.success(messages.startSuccess);
      startModal.close();
    } catch (error) {
      startContestState.fail(error, {
        default: () => alert.error(messages.startError),
      });
    }
  }

  async function onEndContest(contestId: string) {
    endContestState.start();
    try {
      const contest = await contestService.forceEnd(contestId);
      contestsState.finish((it) => recalculateContests(it, contest));
      alert.success(messages.endSuccess);
      endModal.close();
    } catch (error) {
      endContestState.fail(error, {
        default: () => alert.error(messages.endError),
      });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <p className="text-lg font-bold">
          <FormattedMessage {...messages.title} />
        </p>
        <Button
          type="button"
          leftIcon={<FontAwesomeIcon icon={faPlus} />}
          label={messages.new}
          onClick={onNewContest}
          className="btn-primary"
          data-testid="new"
        />
      </div>
      <Table>
        <TableSection head>
          <TableRow>
            <TableCell header className="w-1/20" data-testid="header-slug">
              <FormattedMessage {...messages.headerSlug} />
            </TableCell>
            <TableCell header className="w-11/20" data-testid="header-title">
              <FormattedMessage {...messages.headerTitle} />
            </TableCell>
            <TableCell header className="w-3/20" data-testid="header-start-at">
              <FormattedMessage {...messages.headerStartAt} />
            </TableCell>
            <TableCell header className="w-3/20" data-testid="header-end-at">
              <FormattedMessage {...messages.headerEndAt} />
            </TableCell>
            <TableCell header className="w-2/20" data-testid="header-status">
              <FormattedMessage {...messages.headerStatus} />
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
              <TableCell data-testid="start-at">
                <FormattedDateTime
                  timestamp={contest.startAt}
                  options={{ second: undefined }}
                />
              </TableCell>
              <TableCell data-testid="end-at">
                <FormattedDateTime
                  timestamp={contest.endAt}
                  options={{ second: undefined }}
                />
              </TableCell>
              <TableCell data-testid="status">
                <ContestStatusBadge contest={contest} />
              </TableCell>
              <TableCell>
                <fieldset className="flex gap-x-2">
                  <Button
                    type="button"
                    leftIcon={<FontAwesomeIcon icon={faPlay} />}
                    tooltip={messages.startTooltip}
                    onClick={() => startModal.open(contest.id)}
                    disabled={
                      contestStatuses[contest.id] !== ContestStatus.NOT_STARTED
                    }
                    className="btn-soft"
                    data-testid="start"
                  />
                  <Button
                    type="button"
                    leftIcon={<FontAwesomeIcon icon={faStop} />}
                    tooltip={messages.endTooltip}
                    onClick={() => endModal.open(contest.id)}
                    disabled={
                      contestStatuses[contest.id] !== ContestStatus.IN_PROGRESS
                    }
                    className="btn-soft"
                    data-testid="end"
                  />
                  <Button
                    type="button"
                    leftIcon={<FontAwesomeIcon icon={faChevronRight} />}
                    tooltip={messages.viewTooltip}
                    className="btn-soft"
                    onClick={() => {
                      router.push(routes.ROOT_CONTESTS_EDIT(contest.id));
                    }}
                    data-testid="view"
                  />
                </fieldset>
              </TableCell>
            </TableRow>
          ))}
        </TableSection>
      </Table>
      {contestsState.isLoading && (
        <div className="mx-auto py-20" data-testid="loading">
          <Spinner size="lg" />
        </div>
      )}

      <DialogModal
        modal={startModal}
        onConfirm={onStartContest}
        isLoading={startContestState.isLoading}
      >
        <FormattedMessage {...messages.startConfirm} />
      </DialogModal>

      <DialogModal
        modal={endModal}
        onConfirm={onEndContest}
        isLoading={endContestState.isLoading}
      >
        <FormattedMessage {...messages.endConfirm} />
      </DialogModal>
    </div>
  );
}
