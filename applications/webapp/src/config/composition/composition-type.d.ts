import { AnnouncementListener } from "@/core/port/driven/listener/AnnouncementListener";
import { ClarificationListener } from "@/core/port/driven/listener/ClarificationListener";
import { LeaderboardListener } from "@/core/port/driven/listener/LeaderboardListener";
import { SubmissionListener } from "@/core/port/driven/listener/SubmissionListener";
import { TicketListener } from "@/core/port/driven/listener/TicketListener";
import { AnnouncementWritter } from "@/core/port/driving/usecase/announcement/AnnouncementWritter";
import { AttachmentReader } from "@/core/port/driving/usecase/attachment/AttachmentReader";
import { AttachmentWritter } from "@/core/port/driving/usecase/attachment/AttachmentWritter";
import { AuthenticationWritter } from "@/core/port/driving/usecase/authentication/AuthenticationWritter";
import { ClarificationWritter } from "@/core/port/driving/usecase/clarification/ClarificationWritter";
import { ContestReader } from "@/core/port/driving/usecase/contest/ContestReader";
import { ContestWritter } from "@/core/port/driving/usecase/contest/ContestWritter";
import { DashboardReader } from "@/core/port/driving/usecase/dashboard/DashboardReader";
import { LeaderboardReader } from "@/core/port/driving/usecase/leaderboard/LeaderboardReader";
import { LeaderboardWritter } from "@/core/port/driving/usecase/leaderboard/LeaderboardWritter";
import { SessionReader } from "@/core/port/driving/usecase/session/SessionReader";
import { SessionWritter } from "@/core/port/driving/usecase/session/SessionWritter";
import { StorageReader } from "@/core/port/driving/usecase/storage/StorageReader";
import { StorageWritter } from "@/core/port/driving/usecase/storage/StorageWritter";
import { SubmissionWritter } from "@/core/port/driving/usecase/submission/SubmissionWritter";
import { TicketWritter } from "@/core/port/driving/usecase/ticket/TicketWritter";
import { StompClientFactory } from "@/infrastructure/adapter/stomp/StompClientFactory";

export type Composition = {
  // Listeners
  listenerClientFactory: StompClientFactory;
  announcementListener: AnnouncementListener;
  clarificationListener: ClarificationListener;
  leaderboardListener: LeaderboardListener;
  submissionListener: SubmissionListener;
  ticketListener: TicketListener;

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
  leaderboardWritter: LeaderboardWritter;
  sessionReader: SessionReader;
  sessionWritter: SessionWritter;
  storageReader: StorageReader;
  storageWritter: StorageWritter;
  submissionWritter: SubmissionWritter;
  ticketWritter: TicketWritter;
};
