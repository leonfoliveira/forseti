import {
  announcementListener,
  attachmentService,
  authenticationService,
  authorizationService,
  clarificationListener,
  clarificationService,
  contestService,
  leaderboardListener,
  listenerClientFactory,
  problemService,
  storageService,
  submissionListener,
  submissionService,
} from "@/app/_composition";
import { AuthorizationService } from "@/core/service/AuthorizationService";
import { StompClientFactory } from "@/adapter/stomp/StompClientFactory";
import { StompAnnouncementListener } from "@/adapter/stomp/StompAnnouncementListener";
import { AttachmentService } from "@/core/service/AttachmentService";
import { AuthenticationService } from "@/core/service/AuthenticationService";
import { ClarificationService } from "@/core/service/ClarificationService";
import { ContestService } from "@/core/service/ContestService";
import { ProblemService } from "@/core/service/ProblemService";
import { StorageService } from "@/core/service/StorageService";
import { SubmissionService } from "@/core/service/SubmissionService";
import { StompClarificationListener } from "@/adapter/stomp/StompClarificationListener";
import { StompLeaderboardListener } from "@/adapter/stomp/StompLeaderboardListener";
import { StompSubmissionListener } from "@/adapter/stomp/StompSubmissionListener";

describe("_composition", () => {
  it("should export correct dependencies", () => {
    expect(listenerClientFactory).toBeInstanceOf(StompClientFactory);

    expect(announcementListener).toBeInstanceOf(StompAnnouncementListener);
    expect(clarificationListener).toBeInstanceOf(StompClarificationListener);
    expect(leaderboardListener).toBeInstanceOf(StompLeaderboardListener);
    expect(submissionListener).toBeInstanceOf(StompSubmissionListener);

    expect(attachmentService).toBeInstanceOf(AttachmentService);
    expect(authenticationService).toBeInstanceOf(AuthenticationService);
    expect(authorizationService).toBeInstanceOf(AuthorizationService);
    expect(clarificationService).toBeInstanceOf(ClarificationService);
    expect(contestService).toBeInstanceOf(ContestService);
    expect(problemService).toBeInstanceOf(ProblemService);
    expect(storageService).toBeInstanceOf(StorageService);
    expect(submissionService).toBeInstanceOf(SubmissionService);
  });
});
