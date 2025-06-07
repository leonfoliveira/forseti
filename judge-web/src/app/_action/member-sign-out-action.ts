import { redirect, useRouter } from "next/navigation";
import { useAction } from "@/app/_util/action-hook";
import { authorizationService } from "@/app/_composition";

export function useMemberSignOutAction() {
  const router = useRouter();

  function signOut(contestId: string, shouldRedirect: boolean = true) {
    authorizationService.deleteAuthorization();
    if (shouldRedirect) {
      redirect(`/auth/contests/${contestId}`);
    } else {
      router.push(`/auth/contests/${contestId}`);
    }
  }

  return useAction(signOut);
}
