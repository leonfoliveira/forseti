import { clientConfig, isServer } from "@/config/config";
import { AnnouncementService } from "@/core/application/service/AnnouncementService";
import { AttachmentService } from "@/core/application/service/AttachmentService";
import { AuthenticationService } from "@/core/application/service/AuthenticationService";
import { ClarificationService } from "@/core/application/service/ClarificationService";
import { ContestService } from "@/core/application/service/ContestService";
import { DashboardService } from "@/core/application/service/DashboardService";
import { LeaderboardService } from "@/core/application/service/LeaderboardService";
import { SessionService } from "@/core/application/service/SessionService";
import { StorageService } from "@/core/application/service/StorageService";
import { SubmissionService } from "@/core/application/service/SubmissionService";
import { AnnouncementWritter } from "@/core/port/driving/usecase/announcement/AnnouncementWritter";
import { AttachmentReader } from "@/core/port/driving/usecase/attachment/AttachmentReader";
import { AttachmentWritter } from "@/core/port/driving/usecase/attachment/AttachmentWritter";
import { AuthenticationWritter } from "@/core/port/driving/usecase/authentication/AuthenticationWritter";
import { ClarificationWritter } from "@/core/port/driving/usecase/clarification/ClarificationWritter";
import { ContestReader } from "@/core/port/driving/usecase/contest/ContestReader";
import { ContestWritter } from "@/core/port/driving/usecase/contest/ContestWritter";
import { DashboardReader } from "@/core/port/driving/usecase/dashboard/DashboardReader";
import { LeaderboardReader } from "@/core/port/driving/usecase/leaderboard/LeaderboardReader";
import { SessionReader } from "@/core/port/driving/usecase/session/SessionReader";
import { SessionWritter } from "@/core/port/driving/usecase/session/SessionWritter";
import { StorageReader } from "@/core/port/driving/usecase/storage/StorageReader";
import { StorageWritter } from "@/core/port/driving/usecase/storage/StorageWritter";
import { SubmissionWritter } from "@/core/port/driving/usecase/submission/SubmissionWritter";
import { AxiosAnnouncementRepository } from "@/infrastructure/adapter/axios/AxiosAnnouncementRepository";
import { AxiosAttachmentRepository } from "@/infrastructure/adapter/axios/AxiosAttachmentRepository";
import { AxiosAuthenticationRepository } from "@/infrastructure/adapter/axios/AxiosAuthenticationRepository";
import { AxiosClarificationRepository } from "@/infrastructure/adapter/axios/AxiosClarificationRepository";
import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";
import { AxiosContestRepository } from "@/infrastructure/adapter/axios/AxiosContestRepository";
import { AxiosLeaderboardRepository } from "@/infrastructure/adapter/axios/AxiosLeaderboardRepository";
import { AxiosSessionRepository } from "@/infrastructure/adapter/axios/AxiosSessionRepository";
import { AxiosSubmissionRepository } from "@/infrastructure/adapter/axios/AxiosSubmissionRepository";
import { LocalStorageRepository } from "@/infrastructure/adapter/localstorage/LocalStorageRepository";
import { StompAnnouncementListener } from "@/infrastructure/adapter/stomp/StompAnnouncementListener";
import { StompClarificationListener } from "@/infrastructure/adapter/stomp/StompClarificationListener";
import { StompClientFactory } from "@/infrastructure/adapter/stomp/StompClientFactory";
import { StompLeaderboardListener } from "@/infrastructure/adapter/stomp/StompLeaderboardListener";
import { StompSubmissionListener } from "@/infrastructure/adapter/stomp/StompSubmissionListener";

// Listeners
export const listenerClientFactory = new StompClientFactory(
  `${clientConfig.apiPublicUrl}/ws`,
);

export const announcementListener = new StompAnnouncementListener();
export const clarificationListener = new StompClarificationListener();
export const leaderboardListener = new StompLeaderboardListener();
export const submissionListener = new StompSubmissionListener();

// Repositories
const axiosClient = new AxiosClient(clientConfig.apiPublicUrl, isServer());

const announcementRepository = new AxiosAnnouncementRepository(axiosClient);
const attachmentRepository = new AxiosAttachmentRepository(axiosClient);
const authenticationRepository = new AxiosAuthenticationRepository(axiosClient);
const clarificationRepository = new AxiosClarificationRepository(axiosClient);
const contestRepository = new AxiosContestRepository(axiosClient);
const leaderboardRepository = new AxiosLeaderboardRepository(axiosClient);
const sessionRepository = new AxiosSessionRepository(axiosClient);
const storageRepository = new LocalStorageRepository();
const submissionRepository = new AxiosSubmissionRepository(axiosClient);

// Services
const announcementService = new AnnouncementService(announcementRepository);
const attachmentService = new AttachmentService(attachmentRepository);
const authenticationService = new AuthenticationService(
  authenticationRepository,
);
const clarificationService = new ClarificationService(clarificationRepository);
const contestService = new ContestService(contestRepository, attachmentService);
const dashboardService = new DashboardService(
  contestRepository,
  leaderboardRepository,
  submissionRepository,
);
const leaderboardService = new LeaderboardService(leaderboardRepository);
const sessionService = new SessionService(sessionRepository);
const storageService = new StorageService(storageRepository);
const submissionService = new SubmissionService(
  submissionRepository,
  attachmentService,
);

// UseCases
export const announcementWritter: AnnouncementWritter = announcementService;
export const attachmentReader: AttachmentReader = attachmentService;
export const attachmentWritter: AttachmentWritter = attachmentService;
export const authenticationWritter: AuthenticationWritter =
  authenticationService;
export const clarificationWritter: ClarificationWritter = clarificationService;
export const contestReader: ContestReader = contestService;
export const contestWritter: ContestWritter = contestService;
export const dashboardReader: DashboardReader = dashboardService;
export const leaderboardReader: LeaderboardReader = leaderboardService;
export const sessionReader: SessionReader = sessionService;
export const sessionWritter: SessionWritter = sessionService;
export const storageReader: StorageReader = storageService;
export const storageWritter: StorageWritter = storageService;
export const submissionWritter: SubmissionWritter = submissionService;
