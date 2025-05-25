import { useContainer } from "@/app/_atom/container-atom";
import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { redirect } from "next/navigation";
import { SubmissionEmmitDTO } from "@/core/listener/dto/emmit/SubmissionEmmitDTO";
import { recalculateSubmissions } from "@/app/contests/[id]/_util/submissions-calculator";
import { useSubmissionForMemberListener } from "@/app/_listener/submission-for-member-listener";

export function useFindAllSubmissionsForMemberAction() {
  const { authorizationService, submissionService } = useContainer();
  const submissionForMemberListener = useSubmissionForMemberListener();
  const toast = useToast();
  const action = useAction(findAllForMember);

  async function findAllForMember(contestId: number) {
    try {
      const submissions = await submissionService.findAllForMember();
      const member = authorizationService.getAuthorization()?.member;
      if (member) {
        await submissionForMemberListener.subscribe(
          member.id,
          receiveSubmission,
        );
      }
      return submissions;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        redirect(`/auth/contests/${contestId}`);
      } else {
        toast.error("Error loading submissions");
      }
    }
  }

  function receiveSubmission(newSubmission: SubmissionEmmitDTO) {
    action.setData((data) => {
      return recalculateSubmissions(data, newSubmission);
    });
  }

  return action;
}
