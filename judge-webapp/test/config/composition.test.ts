import { StompAnnouncementListener } from "@/adapter/stomp/StompAnnouncementListener";
import { StompClarificationListener } from "@/adapter/stomp/StompClarificationListener";
import { StompClientFactory } from "@/adapter/stomp/StompClientFactory";
import { StompLeaderboardListener } from "@/adapter/stomp/StompLeaderboardListener";
import { StompSubmissionListener } from "@/adapter/stomp/StompSubmissionListener";
import {
  announcementListener,
  announcementService,
  attachmentService,
  authenticationService,
  clarificationListener,
  contestService,
  leaderboardListener,
  listenerClientFactory,
  storageService,
  submissionListener,
  submissionService,
} from "@/config/composition";
import { AnnouncementService } from "@/core/service/AnnouncementService";
import { AttachmentService } from "@/core/service/AttachmentService";
import { AuthenticationService } from "@/core/service/AuthenticationService";
import { ContestService } from "@/core/service/ContestService";
import { StorageService } from "@/core/service/StorageService";
import { SubmissionService } from "@/core/service/SubmissionService";

jest.unmock("@/config/composition");

describe("composition", () => {
  it("should instantiate dependencies", () => {
    console.log(listenerClientFactory);

    expect(listenerClientFactory).toBeInstanceOf(StompClientFactory);
    expect(announcementListener).toBeInstanceOf(StompAnnouncementListener);
    expect(clarificationListener).toBeInstanceOf(StompClarificationListener);
    expect(leaderboardListener).toBeInstanceOf(StompLeaderboardListener);
    expect(submissionListener).toBeInstanceOf(StompSubmissionListener);
    expect(announcementService).toBeInstanceOf(AnnouncementService);
    expect(attachmentService).toBeInstanceOf(AttachmentService);
    expect(authenticationService).toBeInstanceOf(AuthenticationService);
    expect(contestService).toBeInstanceOf(ContestService);
    expect(storageService).toBeInstanceOf(StorageService);
    expect(submissionService).toBeInstanceOf(SubmissionService);
  });
});
