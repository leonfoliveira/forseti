import { useContainer } from "@/app/_atom/container-atom";
import { useListener } from "@/app/_util/listener-hook";

export function useSubmissionForContestListener() {
  const { submissionListener } = useContainer();

  return useListener(
    submissionListener.subscribeForContest.bind(submissionListener),
    submissionListener.unregister.bind(submissionListener),
  );
}
