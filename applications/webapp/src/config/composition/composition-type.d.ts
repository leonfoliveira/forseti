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
import { StompAnnouncementListener } from "@/infrastructure/adapter/stomp/StompAnnouncementListener";
import { StompClarificationListener } from "@/infrastructure/adapter/stomp/StompClarificationListener";
import { StompClientFactory } from "@/infrastructure/adapter/stomp/StompClientFactory";
import { StompLeaderboardListener } from "@/infrastructure/adapter/stomp/StompLeaderboardListener";
import { StompSubmissionListener } from "@/infrastructure/adapter/stomp/StompSubmissionListener";

export type Composition = {
  // Listeners
  listenerClientFactory: StompClientFactory;
  announcementListener: StompAnnouncementListener;
  clarificationListener: StompClarificationListener;
  leaderboardListener: StompLeaderboardListener;
  submissionListener: StompSubmissionListener;

  // UseCases
  announcementWritter: AnnouncementWritter;
  attachmentReader: AttachmentReader;
  attachmentWritter: AttachmentWritter;
  authenticationWritter: AuthenticationWritter;
  clarificationWritter: ClarificationWritter;
  contestReader: ContestReader;
  contestWritter: ContestWritter;
  dashboardReader: DashboardReader;
  leaderboardReader: LeaderboardReader;
  sessionReader: SessionReader;
  sessionWritter: SessionWritter;
  storageReader: StorageReader;
  storageWritter: StorageWritter;
  submissionWritter: SubmissionWritter;
};
