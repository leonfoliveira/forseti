import { useAction } from "@/app/_util/action-hook";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { useEffect, useRef } from "react";
import { submissionService } from "@/app/_composition";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useToast } from "@/app/_component/toast/toast-provider";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { ListenerClient } from "@/core/domain/model/ListenerClient";

export function useSubscribeForMemberSubmissionAction() {
  const alert = useAlert();
  const toast = useToast();
  const action = useAction(findAllForMember);
  const listenerRef = useRef<ListenerClient>(null);
  const { formatSubmissionStatus } = useContestFormatter();

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        submissionService.unsubscribe(listenerRef.current);
      }
    };
  }, []);

  async function findAllForMember(memberId: number) {
    try {
      listenerRef.current = await submissionService.subscribeForMember(
        memberId,
        receiveSubmission,
      );
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
