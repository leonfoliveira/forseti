import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { notFound } from "next/navigation";
import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { contestService } from "@/app/_composition";

export function useFindContestByIdAction() {
  const toast = useToast();

  async function findContestById(id: number) {
    try {
      return await contestService.findContestById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        notFound();
      } else {
        toast.error("Error loading contest");
      }
    }
  }

  return useAction(findContestById);
}
