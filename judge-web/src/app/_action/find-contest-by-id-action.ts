import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { notFound } from "next/navigation";
import { useContainer } from "@/app/_atom/container-atom";
import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";

export function useFindContestByIdAction() {
  const { contestService } = useContainer();
  const toast = useToast();

  function findContestById(id: number) {
    try {
      return contestService.findContestById(id);
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
