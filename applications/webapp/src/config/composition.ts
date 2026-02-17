import * as clientSideComposition from "@/config/composition/client-side-composition";
import * as serverSideComposition from "@/config/composition/server-side-composition";
import { isClientSide } from "@/config/config";

const composition = isClientSide()
  ? clientSideComposition.build()
  : serverSideComposition.build();

export const listenerClientFactory = composition.listenerClientFactory;
export const announcementListener = composition.announcementListener;
export const clarificationListener = composition.clarificationListener;
export const leaderboardListener = composition.leaderboardListener;
export const submissionListener = composition.submissionListener;
export const announcementWritter = composition.announcementWritter;
export const attachmentReader = composition.attachmentReader;
export const attachmentWritter = composition.attachmentWritter;
export const authenticationWritter = composition.authenticationWritter;
export const clarificationWritter = composition.clarificationWritter;
export const contestReader = composition.contestReader;
export const contestWritter = composition.contestWritter;
export const dashboardReader = composition.dashboardReader;
export const leaderboardReader = composition.leaderboardReader;
export const leaderboardWritter = composition.leaderboardWritter;
export const sessionReader = composition.sessionReader;
export const sessionWritter = composition.sessionWritter;
export const storageReader = composition.storageReader;
export const storageWritter = composition.storageWritter;
export const submissionWritter = composition.submissionWritter;
export const ticketWritter = composition.ticketWritter;
