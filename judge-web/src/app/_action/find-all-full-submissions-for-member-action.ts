import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { redirect } from "next/navigation";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { recalculatePrivateSubmissions } from "@/app/contests/[id]/_util/submissions-calculator";
import { useEffect, useRef } from "react";
import { submissionService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useTranslations } from "next-intl";
import { ListenerClient } from "@/core/domain/model/ListenerClient";

export function useFindAllFullSubmissionsForMemberAction() {
  const alert = useAlert();
  const action = useAction(findAllFullForMember);
  const listenerRef = useRef<ListenerClient>(null);
  const t = useTranslations("_action.find-all-submissions-for-member-action");

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        submissionService.unsubscribe(listenerRef.current);
      }
    };
  }, []);

  async function findAllFullForMember(contestId: string, memberId: string) {
    try {
      const submissions = await submissionService.findAllFullForMember();
      listenerRef.current = await submissionService.subscribeForMember(
        memberId,
        receiveSubmission,
      );
      return submissions;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        redirect(`/auth/contests/${contestId}`);
      } else {
        alert.error(t("error"));
      }
    }
  }

  function receiveSubmission(newSubmission: SubmissionPublicResponseDTO) {
    action.setData((data) => {
      return recalculatePrivateSubmissions(data, newSubmission);
    });
  }

  return action;
}
