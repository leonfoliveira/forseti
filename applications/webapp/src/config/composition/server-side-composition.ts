import { Composition } from "@/config/composition/composition-type";
import { serverConfig } from "@/config/config";
import { AnnouncementService } from "@/core/application/service/AnnouncementService";
import { AttachmentService } from "@/core/application/service/AttachmentService";
import { AuthenticationService } from "@/core/application/service/AuthenticationService";
import { ClarificationService } from "@/core/application/service/ClarificationService";
import { ContestService } from "@/core/application/service/ContestService";
import { DashboardService } from "@/core/application/service/DashboardService";
import { LeaderboardService } from "@/core/application/service/LeaderboardService";
import { SessionService } from "@/core/application/service/SessionService";
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
import { AxiosServerSideClient } from "@/infrastructure/adapter/axios/AxiosServerSideClient";
import { AxiosAnnouncementRepository } from "@/infrastructure/adapter/axios/repository/AxiosAnnouncementRepository";
import { AxiosAttachmentRepository } from "@/infrastructure/adapter/axios/repository/AxiosAttachmentRepository";
import { AxiosAuthenticationRepository } from "@/infrastructure/adapter/axios/repository/AxiosAuthenticationRepository";
import { AxiosClarificationRepository } from "@/infrastructure/adapter/axios/repository/AxiosClarificationRepository";
import { AxiosContestRepository } from "@/infrastructure/adapter/axios/repository/AxiosContestRepository";
import { AxiosLeaderboardRepository } from "@/infrastructure/adapter/axios/repository/AxiosLeaderboardRepository";
import { AxiosSessionRepository } from "@/infrastructure/adapter/axios/repository/AxiosSessionRepository";
import { AxiosSubmissionRepository } from "@/infrastructure/adapter/axios/repository/AxiosSubmissionRepository";
import { StompAnnouncementListener } from "@/infrastructure/adapter/stomp/StompAnnouncementListener";
import { StompClarificationListener } from "@/infrastructure/adapter/stomp/StompClarificationListener";
import { StompClientFactory } from "@/infrastructure/adapter/stomp/StompClientFactory";
import { StompLeaderboardListener } from "@/infrastructure/adapter/stomp/StompLeaderboardListener";
import { StompSubmissionListener } from "@/infrastructure/adapter/stomp/StompSubmissionListener";

export function build(): Composition {
  // Listeners
  const listenerClientFactory = null as unknown as StompClientFactory;
  const announcementListener = null as unknown as StompAnnouncementListener;
  const clarificationListener = null as unknown as StompClarificationListener;
  const leaderboardListener = null as unknown as StompLeaderboardListener;
  const submissionListener = null as unknown as StompSubmissionListener;

  // Repositories
  const axiosClient = new AxiosServerSideClient(serverConfig.apiInternalUrl);

  const announcementRepository = new AxiosAnnouncementRepository(axiosClient);
  const attachmentRepository = new AxiosAttachmentRepository(axiosClient);
  const authenticationRepository = new AxiosAuthenticationRepository(
    axiosClient,
  );
  const clarificationRepository = new AxiosClarificationRepository(axiosClient);
  const contestRepository = new AxiosContestRepository(axiosClient);
  const leaderboardRepository = new AxiosLeaderboardRepository(axiosClient);
  const sessionRepository = new AxiosSessionRepository(axiosClient);
  const submissionRepository = new AxiosSubmissionRepository(axiosClient);

  // Services
  const announcementService = new AnnouncementService(announcementRepository);
  const attachmentService = new AttachmentService(attachmentRepository);
  const authenticationService = new AuthenticationService(
    authenticationRepository,
  );
  const clarificationService = new ClarificationService(
    clarificationRepository,
  );
  const contestService = new ContestService(
    contestRepository,
    attachmentService,
  );
  const dashboardService = new DashboardService(
    contestRepository,
    leaderboardRepository,
    submissionRepository,
  );
  const leaderboardService = new LeaderboardService(leaderboardRepository);
  const sessionService = new SessionService(sessionRepository);
  const submissionService = new SubmissionService(
    submissionRepository,
    attachmentService,
  );

  // UseCases
  const announcementWritter: AnnouncementWritter = announcementService;
  const attachmentReader: AttachmentReader = attachmentService;
  const attachmentWritter: AttachmentWritter = attachmentService;
  const authenticationWritter: AuthenticationWritter = authenticationService;
  const clarificationWritter: ClarificationWritter = clarificationService;
  const contestReader: ContestReader = contestService;
  const contestWritter: ContestWritter = contestService;
  const dashboardReader: DashboardReader = dashboardService;
  const leaderboardReader: LeaderboardReader = leaderboardService;
  const sessionReader: SessionReader = sessionService;
  const sessionWritter: SessionWritter = sessionService;
  const storageReader: StorageReader = null as unknown as StorageReader;
  const storageWritter: StorageWritter = null as unknown as StorageWritter;
  const submissionWritter: SubmissionWritter = submissionService;

  return {
    listenerClientFactory,
    announcementListener,
    clarificationListener,
    leaderboardListener,
    submissionListener,
    announcementWritter,
    attachmentReader,
    attachmentWritter,
    authenticationWritter,
    clarificationWritter,
    contestReader,
    contestWritter,
    dashboardReader,
    leaderboardReader,
    sessionReader,
    sessionWritter,
    storageReader,
    storageWritter,
    submissionWritter,
  };
}
