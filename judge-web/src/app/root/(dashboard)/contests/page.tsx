"use client";

import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/app/_component/spinner";
import { Button } from "@/app/_component/form/button";
import { ContestsTable } from "@/app/root/(dashboard)/contests/_component/contests-table";
import { useTranslations } from "next-intl";
import { routes } from "@/app/_routes";
import { contestService } from "@/app/_composition";
import { useLoadableState } from "@/app/_util/loadable-state";
import { WithStatus } from "@/core/service/dto/output/ContestWithStatus";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { handleError } from "@/app/_util/error-handler";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { useAlert } from "@/app/_context/notification-context";

export default function RootContestsPage() {
  const contestsState =
    useLoadableState<WithStatus<ContestMetadataResponseDTO>[]>();

  const router = useRouter();
  const alert = useAlert();
  const t = useTranslations("root.contests");

  useEffect(() => {
    async function findAllContests() {
      contestsState.start();
      try {
        const contests = await contestService.findAllContestMetadata();
        contestsState.finish(contests);
      } catch (error) {
        contestsState.fail(error);
        handleError(error, {
          [UnauthorizedException.name]: () => redirect(routes.ROOT_SIGN_IN),
          [NotFoundException.name]: () => redirect(routes.FORBIDDEN),
          default: () => alert.error(t("find-all-error")),
        });
      }
    }
    findAllContests();
  }, []);

  function onNewContest() {
    router.push(routes.ROOT_CONTESTS_NEW);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center">
          <h1 className="text-2xl inline-block mr-3">{t("header")}</h1>
          {contestsState.isLoading && <Spinner data-testid="spinner" />}
        </div>
        <Button
          type="button"
          onClick={onNewContest}
          className="btn-primary"
          data-testid="new"
        >
          {t("new:label")}
        </Button>
      </div>
      <ContestsTable contests={contestsState.data || []} />
    </div>
  );
}
