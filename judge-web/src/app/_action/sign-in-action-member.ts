import { MemberSignInFormType } from "@/app/auth/_form/sign-in-form-type";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useRouter } from "next/navigation";
import { useAction } from "@/app/_util/action-hook";
import { authenticationService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useTranslations } from "next-intl";

export function useMemberSignInAction() {
  const alert = useAlert();
  const router = useRouter();
  const t = useTranslations("_action.member-sign-in-action");

  async function signIn(contestId: string, data: MemberSignInFormType) {
    try {
      await authenticationService.authenticateMember(contestId, data);
      router.push(`/contests/${contestId}`);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        alert.warning(t("unauthorized"));
      } else {
        alert.error(t("error"));
      }
    }
  }

  return useAction(signIn);
}
