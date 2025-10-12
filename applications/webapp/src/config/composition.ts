import { AxiosAnnouncementRepository } from "@/adapter/axios/AxiosAnnouncementRepository";
import { AxiosAttachmentRepository } from "@/adapter/axios/AxiosAttachmentRepository";
import { AxiosAuthenticationRepository } from "@/adapter/axios/AxiosAuthenticationRepository";
import { AxiosClarificationRepository } from "@/adapter/axios/AxiosClarificationRepository";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AxiosContestRepository } from "@/adapter/axios/AxiosContestRepository";
import { AxiosLeaderboardRepository } from "@/adapter/axios/AxiosLeaderboardRepository";
import { AxiosSessionRepository } from "@/adapter/axios/AxiosSessionRepository";
import { AxiosSubmissionRepository } from "@/adapter/axios/AxiosSubmissionRepository";
import { LocalStorageRepository } from "@/adapter/localstorage/LocalStorageRepository";
import { StompAnnouncementListener } from "@/adapter/stomp/StompAnnouncementListener";
import { StompClarificationListener } from "@/adapter/stomp/StompClarificationListener";
import { StompClientFactory } from "@/adapter/stomp/StompClientFactory";
import { StompLeaderboardListener } from "@/adapter/stomp/StompLeaderboardListener";
import { StompSubmissionListener } from "@/adapter/stomp/StompSubmissionListener";
import { serverConfig, clientConfig, isServer } from "@/config/config";
import { AnnouncementService } from "@/core/service/AnnouncementService";
import { AttachmentService } from "@/core/service/AttachmentService";
import { AuthenticationService } from "@/core/service/AuthenticationService";
import { ClarificationService } from "@/core/service/ClarificationService";
import { ContestService } from "@/core/service/ContestService";
import { LeaderboardService } from "@/core/service/LeaderboardService";
import { SessionService } from "@/core/service/SessionService";
import { StorageService } from "@/core/service/StorageService";
import { SubmissionService } from "@/core/service/SubmissionService";

const storageRepository = new LocalStorageRepository();

const apiUrl = isServer()
  ? serverConfig.apiInternalUrl
  : clientConfig.apiPublicUrl;
const axiosClient = new AxiosClient(apiUrl, isServer());
export const listenerClientFactory = new StompClientFactory(`${apiUrl}/ws`);

export const announcementListener = new StompAnnouncementListener();
export const clarificationListener = new StompClarificationListener();
export const leaderboardListener = new StompLeaderboardListener();
export const submissionListener = new StompSubmissionListener();

export const announcementService = new AnnouncementService(
  new AxiosAnnouncementRepository(axiosClient),
);
export const attachmentService = new AttachmentService(
  new AxiosAttachmentRepository(axiosClient),
);
export const authenticationService = new AuthenticationService(
  new AxiosAuthenticationRepository(axiosClient),
);
export const sessionService = new SessionService(
  new AxiosSessionRepository(axiosClient),
);
export const clarificationService = new ClarificationService(
  new AxiosClarificationRepository(axiosClient),
);
export const contestService = new ContestService(
  new AxiosContestRepository(axiosClient),
  attachmentService,
);
export const leaderboardService = new LeaderboardService(
  new AxiosLeaderboardRepository(axiosClient),
);
export const storageService = new StorageService(storageRepository);
export const submissionService = new SubmissionService(
  new AxiosSubmissionRepository(axiosClient),
  attachmentService,
);
