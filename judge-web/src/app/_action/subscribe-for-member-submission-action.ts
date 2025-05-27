import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { useEffect, useRef } from "react";
import { submissionService } from "@/app/_composition";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { formatSubmissionStatus } from "@/app/_util/contest-utils";
import { CompatClient } from "@stomp/stompjs";

export function useSubscribeForMemberSubmissionAction() {
  const toast = useToast();
  const action = useAction(findAllForMember);
  const listenerRef = useRef<CompatClient>(null);

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        submissionService.unsubscribe(listenerRef.current);
      }
    };
  }, []);

  async function findAllForMember(memberId: number) {
    try {
      await submissionService.subscribeForMember(memberId, receiveSubmission);
    } catch {
      toast.error("Error subscribing to submissions");
    }
  }

  function receiveSubmission(newSubmission: SubmissionPublicResponseDTO) {
    if (newSubmission.status === SubmissionStatus.JUDGING) {
      return;
    } else if (newSubmission.status === SubmissionStatus.ACCEPTED) {
      toast.success(formatSubmissionStatus(newSubmission.status));
    } else {
      toast.error(formatSubmissionStatus(newSubmission.status));
    }
  }

  return action;
}
