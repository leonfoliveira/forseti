import { redirect, useRouter } from "next/navigation";
import { useAction } from "@/app/_util/action-hook";
import { authorizationService } from "@/app/_composition";

export function useRootSignOutAction() {
  const router = useRouter();

  function signOut(shouldRedirect: boolean = true) {
    authorizationService.deleteAuthorization();
    if (shouldRedirect) {
      redirect("/auth/root");
    } else {
      router.push("/auth/root");
    }
  }

  return useAction(signOut);
}
