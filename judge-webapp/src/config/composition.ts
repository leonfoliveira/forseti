import { AxiosAttachmentRepository } from "@/adapter/axios/AxiosAttachmentRepository";
import { AxiosAuthenticationRepository } from "@/adapter/axios/AxiosAuthenticationRepository";
import { AxiosClarificationRepository } from "@/adapter/axios/AxiosClarificationRepository";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AxiosContestRepository } from "@/adapter/axios/AxiosContestRepository";
import { AxiosProblemRepository } from "@/adapter/axios/AxiosProblemRepository";
import { AxiosSubmissionRepository } from "@/adapter/axios/AxiosSubmissionRepository";
import { LocalStorageRepository } from "@/adapter/localstorage/LocalStorageRepository";
import { StompAnnouncementListener } from "@/adapter/stomp/StompAnnouncementListener";
import { StompClarificationListener } from "@/adapter/stomp/StompClarificationListener";
import { StompClientFactory } from "@/adapter/stomp/StompClientFactory";
import { StompLeaderboardListener } from "@/adapter/stomp/StompLeaderboardListener";
import { StompSubmissionListener } from "@/adapter/stomp/StompSubmissionListener";
import { env } from "@/config/env";
import { AttachmentService } from "@/core/service/AttachmentService";
import { AuthenticationService } from "@/core/service/AuthenticationService";
import { ClarificationService } from "@/core/service/ClarificationService";
import { ContestService } from "@/core/service/ContestService";
import { ProblemService } from "@/core/service/ProblemService";
import { StorageService } from "@/core/service/StorageService";
import { SubmissionService } from "@/core/service/SubmissionService";

const storageRepository = new LocalStorageRepository();

const axiosClient = new AxiosClient(env.API_URL);
export const listenerClientFactory = new StompClientFactory(
  `${env.API_URL}/ws`
);

export const announcementListener = new StompAnnouncementListener();
export const clarificationListener = new StompClarificationListener();
export const leaderboardListener = new StompLeaderboardListener();
export const submissionListener = new StompSubmissionListener();

export const attachmentService = new AttachmentService(
  new AxiosAttachmentRepository(axiosClient)
);
export const authenticationService = new AuthenticationService(
  new AxiosAuthenticationRepository(axiosClient)
);
export const clarificationService = new ClarificationService(
  new AxiosClarificationRepository(axiosClient)
);
export const contestService = new ContestService(
  new AxiosContestRepository(axiosClient),
  attachmentService
);
export const problemService = new ProblemService(
  new AxiosProblemRepository(axiosClient),
  attachmentService
);
export const storageService = new StorageService(storageRepository);
export const submissionService = new SubmissionService(
  new AxiosSubmissionRepository(axiosClient)
);
