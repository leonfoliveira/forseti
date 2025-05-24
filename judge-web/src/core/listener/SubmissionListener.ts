import { SubmissionEmmitDTO } from "@/core/listener/dto/emmit/SubmissionEmmitDTO";

export interface SubmissionListener {
  subscribeForContest: (
    contestId: number,
    cb: (submission: SubmissionEmmitDTO) => void,
  ) => Promise<string>;

  subscribeForMember: (
    memberId: number,
    cb: (submission: SubmissionEmmitDTO) => void,
  ) => Promise<string>;

  unregister: (id: string) => void;
}
