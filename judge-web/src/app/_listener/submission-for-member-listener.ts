import { useContainer } from "@/app/_atom/container-atom";
import { useListener } from "@/app/_util/listener-hook";

export function useSubmissionForMemberListener() {
  const { submissionListener } = useContainer();

  return useListener(
    submissionListener.subscribeForMember.bind(submissionListener),
    submissionListener.unregister.bind(submissionListener),
  );
}
