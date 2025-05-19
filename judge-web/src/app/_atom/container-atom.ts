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

export const containerAtom = atom(() => {
  const authorizationRepository = new LocalStorageAuthorizationRepository();
  const authorizationService = new AuthorizationService(
    authorizationRepository,
  );

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const axiosClient = new AxiosClient(baseUrl, authorizationService);

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
  const contestService = new ContestService(contestRepository);
  const problemService = new ProblemService(problemRepository);
  const submissionService = new SubmissionService(submissionRepository);

  return {
    attachmentService,
    authenticationService,
    authorizationService,
    contestService,
    problemService,
    submissionService,
  };
});

export function useContainer() {
  return useAtomValue(containerAtom);
}
