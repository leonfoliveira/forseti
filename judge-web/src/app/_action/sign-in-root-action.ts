import { RootSignInFormType } from "@/app/auth/_form/sign-in-form-type";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useToast } from "@/app/_util/toast-hook";
import { useRouter } from "next/navigation";
import { useAction } from "@/app/_util/action-hook";
import { authenticationService } from "@/app/_composition";

export function useRootSignInAction() {
  const toast = useToast();
  const router = useRouter();

  async function signIn(data: RootSignInFormType) {
    try {
      await authenticationService.authenticateRoot(data);
      router.push("/root");
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        toast.warning("Invalid password");
      } else {
        toast.error("Error signing in");
      }
    }
  }

  return useAction(signIn);
}
