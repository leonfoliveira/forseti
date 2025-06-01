import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { CreateSubmissionInputDTO } from "@/core/service/dto/input/CreateSubmissionInputDTO";
import { useMemberSignOutAction } from "@/app/_action/member-sign-out-action";
import { submissionService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useTranslations } from "next-intl";

export function useCreateSubmissionAction() {
  const alert = useAlert();
  const signOutAction = useMemberSignOutAction();
  const t = useTranslations("_action.create-submission-action");

  async function createSubmission(
    contestId: number,
    input: CreateSubmissionInputDTO,
  ) {
    try {
      const submission = await submissionService.createSubmission(input);
      alert.success(t("success"));
      return submission;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        await signOutAction.act(contestId);
      } else {
        alert.error(t("error"));
      }
    }
  }

  return useAction(createSubmission);
}
