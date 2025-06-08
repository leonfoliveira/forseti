import { useAction } from "@/app/_util/action-hook";
import { useEffect, useRef } from "react";
import { submissionService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";

export function useSubscribeForContestSubmissionsAction() {
  const alert = useAlert();
  const listenerRef = useRef<ListenerClient>(null);

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        submissionService.unsubscribe(listenerRef.current);
      }
    };
  }, []);

  async function findAllForMember(
    contestId: string,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ) {
    try {
      listenerRef.current = await submissionService.subscribeForContest(
        contestId,
        cb,
      );
    } catch {
      alert.error("Error subscribing to submissions");
    }
  }

  return useAction(findAllForMember);
}
