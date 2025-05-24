import { useContainer } from "@/app/_atom/container-atom";
import { redirect, useRouter } from "next/navigation";
import { useAction } from "@/app/_util/action-hook";

export function useMemberSignOutAction() {
  const { authorizationService } = useContainer();
  const router = useRouter();

  function signOut(contestId: number, shouldRedirect: boolean = true) {
    authorizationService.deleteAuthorization();
    if (shouldRedirect) {
      redirect(`/auth/contests/${contestId}`);
    } else {
      router.push(`/auth/contests/${contestId}`);
    }
  }

  return useAction(signOut);
}
