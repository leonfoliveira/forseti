import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { redirect } from "next/navigation";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { recalculatePrivateSubmissions } from "@/app/contests/[id]/_util/submissions-calculator";
import { useEffect, useRef } from "react";
import { submissionService } from "@/app/_composition";
import { CompatClient } from "@stomp/stompjs";
import { useAlert } from "@/app/_component/alert/alert-provider";

export function useFindAllSubmissionsForMemberAction() {
  const alert = useAlert();
  const action = useAction(findAllForMember);
  const listenerRef = useRef<CompatClient>(null);

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        submissionService.unsubscribe(listenerRef.current);
      }
    };
  }, []);

  async function findAllForMember(contestId: number, memberId: number) {
    try {
      const submissions = await submissionService.findAllForMember();
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
        alert.error("Error loading submissions");
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
