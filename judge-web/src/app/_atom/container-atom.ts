import { atom, useAtomValue } from "jotai";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { LocalStorageAuthorizationRepository } from "@/adapter/localstorage/LocalStorageAuthorizationRepository";
import { AuthorizationService } from "@/core/service/AuthorizationService";
import { AuthenticationService } from "@/core/service/AuthenticationService";
import { AxiosAuthenticationRepository } from "@/adapter/axios/AxiosAuthenticationRepository";
import { AxiosContestRepository } from "@/adapter/axios/AxiosContestRepository";
import { AxiosProblemRepository } from "@/adapter/axios/AxiosProblemRepository";
import { ContestService } from "@/core/service/ContestService";
import { ProblemService } from "@/core/service/ProblemService";
import { AxiosAttachmentRepository } from "@/adapter/axios/AxiosAttachmentRepository";
import { AxiosSubmissionRepository } from "@/adapter/axios/AxiosSubmissionRepository";
import { AttachmentService } from "@/core/service/AttachmentService";
import { SubmissionService } from "@/core/service/SubmissionService";
import { config } from "@/app/_config";
import { StompClient } from "@/adapter/stomp/StompClient";
import { StompSubmissionListener } from "@/adapter/stomp/StompSubmissionListener";

export const containerAtom = atom(() => {
  const authorizationRepository = new LocalStorageAuthorizationRepository();
  const authorizationService = new AuthorizationService(
    authorizationRepository,
  );

  const axiosClient = new AxiosClient(config.apiUrl, authorizationService);

  const attachmentRepository = new AxiosAttachmentRepository(axiosClient);
  const authenticationRepository = new AxiosAuthenticationRepository(
    axiosClient,
  );
  const contestRepository = new AxiosContestRepository(axiosClient);
  const problemRepository = new AxiosProblemRepository(axiosClient);
  const submissionRepository = new AxiosSubmissionRepository(axiosClient);

  const attachmentService = new AttachmentService(attachmentRepository);
  const authenticationService = new AuthenticationService(
    authenticationRepository,
    authorizationRepository,
  );
  const contestService = new ContestService(
    contestRepository,
    attachmentService,
  );
  const problemService = new ProblemService(
    problemRepository,
    attachmentService,
  );
  const submissionService = new SubmissionService(submissionRepository);

  const stompClient = new StompClient(config.wsUrl);

  const submissionListener = new StompSubmissionListener(stompClient);

  return {
    attachmentService,
    authenticationService,
    authorizationService,
    contestService,
    problemService,
    submissionService,
    submissionListener,
  };
});

export function useContainer() {
  return useAtomValue(containerAtom);
}
