import { AxiosClient } from "@/infrastructure/axios/AxiosClient";
import { AxiosAttachmentRepository } from "@/infrastructure/axios/repository/AxiosAttachmentRepository";
import { AxiosAuthenticationRepository } from "@/infrastructure/axios/repository/AxiosAuthenticationRepository";

import { env } from "./env";
import { AxiosAnnouncementRepository } from "@/infrastructure/axios/repository/AxiosAnnouncementRepository";
import { AxiosContestRepository } from "@/infrastructure/axios/repository/AxiosContestRepository";
import { AxiosDashboardRepository } from "@/infrastructure/axios/repository/AxiosDashboardRepository";
import { AxiosSessionRepository } from "@/infrastructure/axios/repository/AxiosSessionRepository";
import { LocalStorageRepositoryAdapter } from "@/infrastructure/localstorage/LocalStorageRepositoryAdapter";
import { AxiosSubmissionRepository } from "@/infrastructure/axios/repository/AxiosSubmissionRepository";
import { AnnouncementService } from "@/service/AnnouncementService";
import { AttachmentService } from "@/service/AttachmentService";
import { AuthenticationService } from "@/service/AuthenticationService";
import { ContestService } from "@/service/ContestService";
import { DashboardService } from "@/service/DashboardService";
import { SessionService } from "@/service/SessionService";
import { LocalStorageService } from "@/service/LocalStorageService";
import { SubmissionService } from "@/service/SubmissionService";
import { AnnouncementWriter } from "@/port/input/usecase/announcement/AnnouncementWriter";
import { AttachmentReader } from "@/port/input/usecase/attachment/AttachmentReader";
import { AttachmentWriter } from "@/port/input/usecase/attachment/AttachmentWriter";
import { LocalStorageWriter } from "@/port/input/usecase/localstorage/LocalStorageWriter";
import { AuthenticationWriter } from "@/port/input/usecase/authentication/AuthenticationWriter";
import { ContestReader } from "@/port/input/usecase/contest/ContestReader";
import { ContestWriter } from "@/port/input/usecase/contest/ContestWriter";
import { DashboardReader } from "@/port/input/usecase/dashboard/DashboardReader";
import { SessionReader } from "@/port/input/usecase/session/SessionReader";
import { SessionWriter } from "@/port/input/usecase/session/SessionWriter";
import { LocalStorageReader } from "@/port/input/usecase/localstorage/LocalStorageReader";
import { SubmissionWriter } from "@/port/input/usecase/submission/SubmissionWriter";
import { S3BucketRepository } from "@/infrastructure/axios/bucket/S3BucketRepository";
import { AxiosClarificationRepository } from "@/infrastructure/axios/repository/AxiosClarificationRepository";
import { ClarificationService } from "@/service/ClarificationService";
import { ClarificationWriter } from "@/port/input/usecase/clarification/ClarificationWriter";
import { SSEAdminDashboardRoomListener } from "@/infrastructure/sse/SSEAdminDashboardRoomListener";
import { SSEMemberPrivateRoomListener } from "@/infrastructure/sse/SSEMemberPrivateRoomListener";
import { SSEJudgeDashboardRoomListener } from "@/infrastructure/sse/SSEJudgeDashboardRoomListener";
import { SSEContestantDashboardRoomListener } from "@/infrastructure/sse/SSEContestantDashboardRoomListener";
import { SSESpectatorDashboardRoomListener } from "@/infrastructure/sse/SSESpectatorDashboardRoomListener";
import { AdminDashboardRoomListener } from "@/port/output/sse/AdminDashboardRoomListener";
import { ContestantDashboardRoomListener } from "@/port/output/sse/ContestantDashboardRoomListener";
import { SpectatorDashboardRoomListener } from "@/port/output/sse/SpectatorDashboardRoomListener";
import { JudgeDashboardRoomListener } from "@/port/output/sse/JudgeDashboardRoomListener";
import { MemberPrivateRoomListener } from "@/port/output/sse/MemberPrivateRoomListener";
import { SSEStaffDashboardRoomListener } from "@/infrastructure/sse/SSEStaffDashboardRoomListener";
import { StaffDashboardRoomListener } from "@/port/output/sse/StaffDashboardRoomListener";
import { PrintRequestWriter } from "@/port/input/usecase/printRequest/PrintRequestWriter";
import { AxiosPrintRequestRepository } from "@/infrastructure/axios/repository/AxiosPrintRequestRepository";
import { PrintRequestService } from "@/service/PrintRequestService";

// Repositories
const axiosClient = new AxiosClient(env.apiUrl);

const announcementRepository = new AxiosAnnouncementRepository(axiosClient);
const attachmentRepository = new AxiosAttachmentRepository(axiosClient);
const authenticationRepository = new AxiosAuthenticationRepository(axiosClient);
const clarificationRepository = new AxiosClarificationRepository(axiosClient);
const contestRepository = new AxiosContestRepository(axiosClient);
const dashboardRepository = new AxiosDashboardRepository(axiosClient);
const sessionRepository = new AxiosSessionRepository(axiosClient);
const localStorageRepository = new LocalStorageRepositoryAdapter();
const submissionRepository = new AxiosSubmissionRepository(axiosClient);
const bucketRepository = new S3BucketRepository();
const printRequestRepository = new AxiosPrintRequestRepository(axiosClient);

// Services
const attachmentService = new AttachmentService(
  attachmentRepository,
  bucketRepository,
);
const authenticationService = new AuthenticationService(
  authenticationRepository,
);
const clarificationService = new ClarificationService(clarificationRepository);
const contestService = new ContestService(contestRepository, attachmentService);
const dashboardService = new DashboardService(dashboardRepository);
const sessionService = new SessionService(sessionRepository);
const localStorageService = new LocalStorageService(localStorageRepository);
const submissionService = new SubmissionService(
  submissionRepository,
  attachmentService,
);
const announcementService = new AnnouncementService(announcementRepository);
const printRequestService = new PrintRequestService(printRequestRepository);

// SSE Listeners
const adminDashboardRoomListener = new SSEAdminDashboardRoomListener(
  env.apiUrl,
);
const judgeDashboardRoomListener = new SSEJudgeDashboardRoomListener(
  env.apiUrl,
);
const staffDashboardRoomListener = new SSEStaffDashboardRoomListener(
  env.apiUrl,
);
const contestantDashboardRoomListener = new SSEContestantDashboardRoomListener(
  env.apiUrl,
);
const spectatorDashboardRoomListener = new SSESpectatorDashboardRoomListener(
  env.apiUrl,
);
const memberPrivateRoomListener = new SSEMemberPrivateRoomListener(env.apiUrl);

const Composition: {
  attachmentReader: AttachmentReader;
  attachmentWriter: AttachmentWriter;
  authenticationWriter: AuthenticationWriter;
  contestReader: ContestReader;
  contestWriter: ContestWriter;
  dashboardReader: DashboardReader;
  sessionReader: SessionReader;
  sessionWriter: SessionWriter;
  localStorageReader: LocalStorageReader;
  localStorageWriter: LocalStorageWriter;
  submissionWriter: SubmissionWriter;
  clarificationWriter: ClarificationWriter;
  announcementWriter: AnnouncementWriter;
  adminDashboardRoomListener: AdminDashboardRoomListener;
  judgeDashboardRoomListener: JudgeDashboardRoomListener;
  staffDashboardRoomListener: StaffDashboardRoomListener;
  contestantDashboardRoomListener: ContestantDashboardRoomListener;
  spectatorDashboardRoomListener: SpectatorDashboardRoomListener;
  memberPrivateRoomListener: MemberPrivateRoomListener;
  printRequestWriter: PrintRequestWriter;
} = {
  attachmentReader: attachmentService,
  attachmentWriter: attachmentService,
  authenticationWriter: authenticationService,
  contestReader: contestService,
  contestWriter: contestService,
  dashboardReader: dashboardService,
  sessionReader: sessionService,
  sessionWriter: sessionService,
  localStorageReader: localStorageService,
  localStorageWriter: localStorageService,
  submissionWriter: submissionService,
  clarificationWriter: clarificationService,
  announcementWriter: announcementService,
  adminDashboardRoomListener: adminDashboardRoomListener,
  judgeDashboardRoomListener: judgeDashboardRoomListener,
  staffDashboardRoomListener: staffDashboardRoomListener,
  contestantDashboardRoomListener: contestantDashboardRoomListener,
  spectatorDashboardRoomListener: spectatorDashboardRoomListener,
  memberPrivateRoomListener: memberPrivateRoomListener,
  printRequestWriter: printRequestService,
};

export { Composition };
