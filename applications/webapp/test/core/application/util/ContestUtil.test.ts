import { ContestUtil } from "@/core/application/util/ContestUtil";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";

describe("ContestUtil", () => {
  describe("getStatus", () => {
    it("should return NOT_STARTED when contest has not started", () => {
      const startAt = new Date();
      const endAt = new Date();
      startAt.setHours(startAt.getHours() + 1);
      endAt.setHours(endAt.getHours() + 2);

      const contest = {
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      };
      const status = ContestUtil.getStatus(contest);
      expect(status).toBe(ContestStatus.NOT_STARTED);
    });

    it("should return IN_PROGRESS when contest is ongoing", () => {
      const startAt = new Date();
      const endAt = new Date();
      startAt.setHours(startAt.getHours() - 1);
      endAt.setHours(endAt.getHours() + 1);

      const contest = {
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      };
      const status = ContestUtil.getStatus(contest);
      expect(status).toBe(ContestStatus.IN_PROGRESS);
    });

    it("should return ENDED when contest has ended", () => {
      const startAt = new Date();
      const endAt = new Date();
      startAt.setHours(startAt.getHours() - 2);
      endAt.setHours(endAt.getHours() - 1);

      const contest = {
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      };
      const status = ContestUtil.getStatus(contest);
      expect(status).toBe(ContestStatus.ENDED);
    });
  });
});
