import { RootSignInFormType } from "@/app/auth/_form/sign-in-form-type";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useRouter } from "next/navigation";
import { useAction } from "@/app/_util/action-hook";
import { authenticationService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useTranslations } from "next-intl";

export function useRootSignInAction() {
  const alert = useAlert();
  const router = useRouter();
  const t = useTranslations("_action.member-sign-in-action");

  async function signIn(data: RootSignInFormType) {
    try {
      await authenticationService.authenticateRoot(data);
      router.push("/root");
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
