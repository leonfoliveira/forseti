import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { redirect, useRouter } from "next/navigation";
import { useAction } from "@/app/_util/action-hook";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";

export function useDeleteContestAction() {
  const alert = useAlert();
  const router = useRouter();

  async function deleteContest(id: number) {
    try {
      await contestService.deleteContest(id);
      alert.success("Contest deleted successfully");
      router.push("/root/contests");
    } catch (error) {
      if (error instanceof NotFoundException) {
        redirect(`/not-found`);
      } else {
        alert.error("Error deleting contest");
      }
    }
  }

  return useAction(deleteContest);
}
