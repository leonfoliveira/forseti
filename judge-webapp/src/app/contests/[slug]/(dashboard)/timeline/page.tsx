"use client";

import React, { useEffect } from "react";
import { Table } from "@/app/_component/table/table";
import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { toLocaleString } from "@/app/_util/date-utils";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { useTranslations } from "next-intl";
import { useContest } from "@/app/_context/contest-context";
import { SubmissionAnswerBadge } from "@/app/contests/[slug]/(dashboard)/_component/submission-answer-badge";
import { useLoadableState } from "@/app/_util/loadable-state";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { contestService } from "@/app/_composition";
import { handleError } from "@/app/_util/error-handler";
import { Spinner } from "@/app/_component/spinner";
import { useAlert } from "@/app/_context/notification-context";

export default function ContestTimelinePage() {
  const contest = useContest();
  const submissionsState = useLoadableState<SubmissionPublicResponseDTO[]>();

  const { formatLanguage } = useContestFormatter();
  const alert = useAlert();
  const t = useTranslations("contests.[slug].timeline");

  useEffect(() => {
    async function loadSubmissions() {
      submissionsState.start();
      try {
        const submissions = await contestService.findAllContestSubmissions(
          contest.id,
        );
        submissionsState.finish(submissions);
      } catch (error) {
        submissionsState.fail(error);
        handleError(error, {
          default: () => alert.error(t("load-error")),
        });
      }
    }

    loadSubmissions();
  }, []);

  return (
    <div>
      <Table>
        <TableSection head>
          <TableRow>
            <TableCell header>{t("header-timestamp")}</TableCell>
            <TableCell header>{t("header-contestant")}</TableCell>
            <TableCell header>{t("header-problem")}</TableCell>
            <TableCell header>{t("header-language")}</TableCell>
            <TableCell header align="right">
              {t("header-status")}
            </TableCell>
          </TableRow>
        </TableSection>
        <TableSection>
          {submissionsState.data?.map((submission) => (
            <TableRow
              key={submission.id}
              className="hover:bg-base-300 transition"
              data-testid="submission:row"
            >
              <TableCell data-testid="submission:created-at">
                {toLocaleString(submission.createdAt)}
              </TableCell>
              <TableCell data-testid="submission:member">
                {submission.member.name}
              </TableCell>
              <TableCell data-testid="submission:problem">
                {submission.problem.letter}
              </TableCell>
              <TableCell data-testid="submission:language">
                {formatLanguage(submission.language)}
              </TableCell>
              <TableCell
                align="right"
                className="font-semibold"
                data-testid="submission:answer"
              >
                <SubmissionAnswerBadge answer={submission.answer} />
              </TableCell>
            </TableRow>
          ))}
        </TableSection>
      </Table>
      {submissionsState.isLoading && (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" data-testid="submissions:spinner" />
        </div>
      )}
      {submissionsState.data?.length === 0 && (
        <div
          className="flex justify-center items-center py-20"
          data-testid="submission:empty"
        >
          <p className="text-neutral-content">{t("submissions-empty")}</p>
        </div>
      )}
    </div>
  );
}
