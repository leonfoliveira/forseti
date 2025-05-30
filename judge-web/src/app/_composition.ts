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
import { StompClient } from "@/adapter/stomp/StompClient";
import { StompSubmissionListener } from "@/adapter/stomp/StompSubmissionListener";
import { config } from "@/app/_config";
import { LocalStorageRepository } from "@/adapter/localstorage/LocalStorageRepository";
import { StorageService } from "@/core/service/StorageService";

const storageRepository = new LocalStorageRepository();

export const authorizationService = new AuthorizationService(storageRepository);

const axiosClient = new AxiosClient(config.apiUrl, authorizationService);
const stompClient = new StompClient(config.wsUrl);

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
);
export const storageService = new StorageService(storageRepository);
export const submissionService = new SubmissionService(
  new AxiosSubmissionRepository(axiosClient),
  new StompSubmissionListener(stompClient),
  attachmentService,
);
