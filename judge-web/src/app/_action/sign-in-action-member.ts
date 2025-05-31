import { MemberSignInFormType } from "@/app/auth/_form/sign-in-form-type";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useRouter } from "next/navigation";
import { useAction } from "@/app/_util/action-hook";
import { authenticationService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";

export function useMemberSignInAction() {
  const alert = useAlert();
  const router = useRouter();

  async function signIn(contestId: number, data: MemberSignInFormType) {
    try {
      await authenticationService.authenticateMember(contestId, data);
      router.push(`/contests/${contestId}`);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        alert.warning("Invalid password");
      } else {
        alert.error("Error signing in");
      }
    }
  }

  return useAction(signIn);
}
