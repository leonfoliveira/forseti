import { SocketIOWebSocketClient } from "@/infrastructure/socketio/SocketIOWebSocketClient";
import { AxiosClient } from "@/infrastructure/axios/AxiosClient";
import { AxiosAttachmentRepository } from "@/infrastructure/axios/repository/AxiosAttachmentRepository";
import { AxiosAuthenticationRepository } from "@/infrastructure/axios/repository/AxiosAuthenticationRepository";

import { env } from "./env";
import { AxiosContestRepository } from "@/infrastructure/axios/repository/AxiosContestRepository";
import { AxiosDashboardRepository } from "@/infrastructure/axios/repository/AxiosDashboardRepository";
import { AxiosSessionRepository } from "@/infrastructure/axios/repository/AxiosSessionRepository";
import { LocalStorageRepositoryAdapter } from "@/infrastructure/localstorage/LocalStorageRepositoryAdapter";
import { AxiosSubmissionRepository } from "@/infrastructure/axios/repository/AxiosSubmissionRepository";
import { AttachmentService } from "@/service/AttachmentService";
import { AuthenticationService } from "@/service/AuthenticationService";
import { ContestService } from "@/service/ContestService";
import { DashboardService } from "@/service/DashboardService";
import { SessionService } from "@/service/SessionService";
import { LocalStorageService } from "@/service/LocalStorageService";
import { SubmissionService } from "@/service/SubmissionService";
import { AttachmentReader } from "@/port/input/usecase/attachment/AttachmentReader";
import { AttachmentWritter } from "@/port/input/usecase/attachment/AttachmentWritter";
import { LocalStorageWritter } from "@/port/input/usecase/localstorage/LocalStorageWritter";
import { AuthenticationWritter } from "@/port/input/usecase/authentication/AuthenticationWritter";
import { ContestReader } from "@/port/input/usecase/contest/ContestReader";
import { ContestWritter } from "@/port/input/usecase/contest/ContestWritter";
import { DashboardReader } from "@/port/input/usecase/dashboard/DashboardReader";
import { SessionReader } from "@/port/input/usecase/session/SessionReader";
import { SessionWritter } from "@/port/input/usecase/session/SessionWritter";
import { LocalStorageReader } from "@/port/input/usecase/localstorage/LocalStorageReader";
import { SubmissionWritter } from "@/port/input/usecase/submission/SubmissionWritter";
import { WebSocketClient } from "@/port/output/websocket/WebSocketClient";
import { S3BucketRepository } from "@/infrastructure/axios/bucket/S3BucketRepository";

const webSocketClient = new SocketIOWebSocketClient(env.wsUrl);

// Repositories
const axiosClient = new AxiosClient(env.httpUrl);

const attachmentRepository = new AxiosAttachmentRepository(axiosClient);
const authenticationRepository = new AxiosAuthenticationRepository(axiosClient);
const contestRepository = new AxiosContestRepository(axiosClient);
const dashboardRepository = new AxiosDashboardRepository(axiosClient);
const sessionRepository = new AxiosSessionRepository(axiosClient);
const localStorageRepository = new LocalStorageRepositoryAdapter();
const submissionRepository = new AxiosSubmissionRepository(axiosClient);
const bucketRepository = new S3BucketRepository();

// Services
const attachmentService = new AttachmentService(
  attachmentRepository,
  bucketRepository,
);
const authenticationService = new AuthenticationService(
  authenticationRepository,
);
const contestService = new ContestService(contestRepository, attachmentService);
const dashboardService = new DashboardService(dashboardRepository);
const sessionService = new SessionService(sessionRepository);
const localStorageService = new LocalStorageService(localStorageRepository);
const submissionService = new SubmissionService(
  submissionRepository,
  attachmentService,
);

const Composition: {
  webSocketClient: WebSocketClient;
  attachmentReader: AttachmentReader;
  attachmentWritter: AttachmentWritter;
  authenticationWritter: AuthenticationWritter;
  contestReader: ContestReader;
  contestWritter: ContestWritter;
  dashboardReader: DashboardReader;
  sessionReader: SessionReader;
  sessionWritter: SessionWritter;
  localStorageReader: LocalStorageReader;
  localStorageWritter: LocalStorageWritter;
  submissionWritter: SubmissionWritter;
} = {
  webSocketClient: webSocketClient,
  attachmentReader: attachmentService,
  attachmentWritter: attachmentService,
  authenticationWritter: authenticationService,
  contestReader: contestService,
  contestWritter: contestService,
  dashboardReader: dashboardService,
  sessionReader: sessionService,
  sessionWritter: sessionService,
  localStorageReader: localStorageService,
  localStorageWritter: localStorageService,
  submissionWritter: submissionService,
};

export { Composition };
