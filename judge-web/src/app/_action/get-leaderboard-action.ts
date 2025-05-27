import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { recalculateLeaderboard } from "@/app/contests/[id]/leaderboard/util/leaderboard-calculator";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { useEffect, useRef } from "react";
import { contestService, submissionService } from "@/app/_composition";
import { CompatClient } from "@stomp/stompjs";

export function useGetLeaderboardAction() {
  const toast = useToast();
  const action = useAction(getLeaderboard);
  const listenerRef = useRef<CompatClient>(null);

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        submissionService.unsubscribe(listenerRef.current);
      }
    };
  }, []);

  async function getLeaderboard(contestId: number) {
    try {
      const leaderboard = await contestService.getLeaderboard(contestId);
      listenerRef.current = await submissionService.subscribeForContest(
        contestId,
        onSubmission,
      );
      return leaderboard;
    } catch (error) {
      console.error(error);
      toast.error("Error loading leaderboard");
    }
  }

  function onSubmission(submission: SubmissionPublicResponseDTO) {
    action.setData((data) => {
      return recalculateLeaderboard(data, submission);
    });
  }

  return action;
}
