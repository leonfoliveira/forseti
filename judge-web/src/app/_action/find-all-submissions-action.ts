import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { recalculatePublicSubmissions } from "@/app/contests/[id]/_util/submissions-calculator";
import { useEffect, useRef } from "react";
import { contestService, submissionService } from "@/app/_composition";
import { CompatClient } from "@stomp/stompjs";

export function useFindAllSubmissionsAction() {
  const toast = useToast();
  const action = useAction(findAllSubmissions);
  const listenerRef = useRef<CompatClient>(null);

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        submissionService.unsubscribe(listenerRef.current);
      }
    };
  }, []);

  async function findAllSubmissions(contestId: number) {
    try {
      const submissions = await contestService.findAllSubmissions(contestId);
      await submissionService.subscribeForContest(contestId, receiveSubmission);
      return submissions;
    } catch {
      toast.error("Error loading submissions");
    }
  }

  function receiveSubmission(newSubmission: SubmissionPublicResponseDTO) {
    action.setData((data) => {
      return recalculatePublicSubmissions(data, newSubmission);
    });
  }

  return action;
}
