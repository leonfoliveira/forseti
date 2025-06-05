import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { useMemberSignOutAction } from "@/app/_action/member-sign-out-action";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { recalculateMemberProblems } from "@/app/contests/[id]/problems/_util/member-problem-calculator";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { contestService, submissionService } from "@/app/_composition";
import { useEffect, useRef } from "react";
import { useAuthorization } from "@/app/_util/authorization-hook";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useTranslations } from "next-intl";
import { ListenerClient } from "@/core/domain/model/ListenerClient";

export function useFindAllProblemsForMemberAction() {
  const authorization = useAuthorization();
  const alert = useAlert();
  const memberSignOutAction = useMemberSignOutAction();
  const action = useAction(findAllProblemsForMember);
  const listenerRef = useRef<ListenerClient>(null);
  const t = useTranslations("_action.find-all-problems-for-member-action");

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        submissionService.unsubscribe(listenerRef.current);
      }
    };
  }, []);

  async function findAllProblemsForMember(contestId: number) {
    try {
      const problems = await contestService.findAllProblemsForMember(contestId);
      const member = authorization?.member;
      if (member) {
        listenerRef.current = await submissionService.subscribeForMember(
          member.id,
          receiveSubmission,
        );
      }
      return problems;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        await memberSignOutAction.act(contestId);
      } else {
        alert.error(t("error"));
      }
    }
  }

  const receiveSubmission = (submission: SubmissionPublicResponseDTO) => {
    if (submission.status === SubmissionStatus.JUDGING) return;
    action.setData((data) => {
      return recalculateMemberProblems(data, submission);
    });
  };

  return action;
}
