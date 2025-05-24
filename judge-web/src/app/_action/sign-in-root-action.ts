import { RootSignInFormType } from "@/app/auth/_form/sign-in-form-type";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useToast } from "@/app/_util/toast-hook";
import { useContainer } from "@/app/_atom/container-atom";
import { useRouter } from "next/navigation";
import { useAction } from "@/app/_util/action-hook";

export function useRootSignInAction() {
  const { authenticationService } = useContainer();
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
