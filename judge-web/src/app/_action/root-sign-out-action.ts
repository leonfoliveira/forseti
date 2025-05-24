import { useContainer } from "@/app/_atom/container-atom";
import { redirect, useRouter } from "next/navigation";
import { useAction } from "@/app/_util/action-hook";

export function useRootSignOutAction() {
  const { authorizationService } = useContainer();
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
