import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { useEffect, useRef } from "react";
import { submissionService } from "@/app/_composition";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { formatSubmissionStatus } from "@/app/_util/contest-utils";
import { CompatClient } from "@stomp/stompjs";
import { useAlert } from "@/app/_component/alert/alert-provider";

export function useSubscribeForMemberSubmissionAction() {
  const alert = useAlert();
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
      console.log("Subscribing to submissions for member:", memberId);
      await submissionService.subscribeForMember(memberId, receiveSubmission);
    } catch {
      alert.error("Error subscribing to submissions");
    }
  }

  function receiveSubmission(newSubmission: SubmissionPublicResponseDTO) {
    switch (newSubmission.status) {
      case SubmissionStatus.JUDGING:
        return;
      case SubmissionStatus.TIME_LIMIT_EXCEEDED:
        return toast.info(formatSubmissionStatus(newSubmission.status));
      case SubmissionStatus.COMPILATION_ERROR:
      case SubmissionStatus.RUNTIME_ERROR:
        return toast.warning(formatSubmissionStatus(newSubmission.status));
      case SubmissionStatus.WRONG_ANSWER:
        return toast.error(formatSubmissionStatus(newSubmission.status));
    }
  }

  return action;
}
