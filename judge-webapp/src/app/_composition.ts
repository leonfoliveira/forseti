import { AuthorizationService } from "@/core/service/AuthorizationService";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AxiosAttachmentRepository } from "@/adapter/axios/AxiosAttachmentRepository";
import { AxiosAuthenticationRepository } from "@/adapter/axios/AxiosAuthenticationRepository";
import { AxiosContestRepository } from "@/adapter/axios/AxiosContestRepository";
import { AxiosSubmissionRepository } from "@/adapter/axios/AxiosSubmissionRepository";
import { AttachmentService } from "@/core/service/AttachmentService";
import { AuthenticationService } from "@/core/service/AuthenticationService";
import { ContestService } from "@/core/service/ContestService";
import { SubmissionService } from "@/core/service/SubmissionService";
import { StompConnector } from "@/adapter/stomp/StompConnector";
import { StompSubmissionListener } from "@/adapter/stomp/StompSubmissionListener";
import { config } from "@/app/_config";
import { LocalStorageRepository } from "@/adapter/localstorage/LocalStorageRepository";
import { StorageService } from "@/core/service/StorageService";
import { StompLeaderboardListener } from "@/adapter/stomp/StompLeaderboardListener";
import { ProblemService } from "@/core/service/ProblemService";
import { AxiosProblemRepository } from "@/adapter/axios/AxiosProblemRepository";
import { ListenerService } from "@/core/service/ListenerService";
import { StompListenerRepository } from "@/adapter/stomp/StompListenerRepository";
import { StompAnnouncementListener } from "@/adapter/stomp/StompAnnouncementListener";
import { StompClarificationListener } from "@/adapter/stomp/StompClarificationListener";

const storageRepository = new LocalStorageRepository();

export const authorizationService = new AuthorizationService(storageRepository);

const axiosClient = new AxiosClient(config.API_URL, authorizationService);
const stompConnector = new StompConnector(
  `${config.API_URL}/ws`,
  authorizationService,
);

export const announcementListener = new StompAnnouncementListener();
export const clarificationListener = new StompClarificationListener();
export const leaderboardListener = new StompLeaderboardListener();
export const submissionListener = new StompSubmissionListener();

export const listenerService = new ListenerService(
  new StompListenerRepository(stompConnector),
);
export const attachmentService = new AttachmentService(
  new AxiosAttachmentRepository(axiosClient),
);
export const authenticationService = new AuthenticationService(
  new AxiosAuthenticationRepository(axiosClient),
  authorizationService,
);
export const contestService = new ContestService(
  new AxiosContestRepository(axiosClient),
  attachmentService,
  new StompLeaderboardListener(),
);
export const problemService = new ProblemService(
  new AxiosProblemRepository(axiosClient),
  attachmentService,
);
export const storageService = new StorageService(storageRepository);
export const submissionService = new SubmissionService(
  new AxiosSubmissionRepository(axiosClient),
  new StompSubmissionListener(),
);
