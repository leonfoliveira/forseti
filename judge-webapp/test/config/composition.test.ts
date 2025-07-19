import {
  announcementListener,
  attachmentService,
  authenticationService,
  authorizationService,
  clarificationListener,
  contestService,
  leaderboardListener,
  listenerClientFactory,
  problemService,
  storageService,
  submissionListener,
  submissionService,
} from "@/config/composition";

describe("composition", () => {
  it("should instantiate dependencies", () => {
    expect(listenerClientFactory).toBeDefined();
    expect(announcementListener).toBeDefined();
    expect(clarificationListener).toBeDefined();
    expect(leaderboardListener).toBeDefined();
    expect(submissionListener).toBeDefined();
    expect(attachmentService).toBeDefined();
    expect(authenticationService).toBeDefined();
    expect(authorizationService).toBeDefined();
    expect(clarificationListener).toBeDefined();
    expect(contestService).toBeDefined();
    expect(problemService).toBeDefined();
    expect(storageService).toBeDefined();
    expect(submissionService).toBeDefined();
  });
});
