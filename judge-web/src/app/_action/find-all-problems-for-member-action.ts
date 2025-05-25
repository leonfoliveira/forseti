import { useContainer } from "@/app/_atom/container-atom";
import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { useMemberSignOutAction } from "@/app/_action/member-sign-out-action";
import { useSubmissionForMemberListener } from "@/app/_listener/submission-for-member-listener";
import { SubmissionEmmitDTO } from "@/core/listener/dto/emmit/SubmissionEmmitDTO";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { recalculateMemberProblems } from "@/app/contests/[id]/problems/_util/member-problem-calculator";

export function useFindAllProblemsForMemberAction() {
  const { authorizationService, contestService } = useContainer();
  const toast = useToast();
  const memberSignOutAction = useMemberSignOutAction();
  const submissionForMemberListener = useSubmissionForMemberListener();
  const action = useAction(findAllProblemsForMember);

  async function findAllProblemsForMember(contestId: number) {
    try {
      const problems = await contestService.findAllProblemsForMember(contestId);
      const member = authorizationService.getAuthorization()?.member;
      if (member) {
        await submissionForMemberListener.subscribe(
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
        toast.error("Error loading problems");
      }
    }
  }

  const receiveSubmission = (submission: SubmissionEmmitDTO) => {
    if (submission.status === SubmissionStatus.JUDGING) return;
    action.setData((data) => {
      return recalculateMemberProblems(data, submission);
    });
  };

  return action;
}
