import { Submission } from "@/test/entity/Submission";

export type PrintRequest = {
  submission: Submission;
  status: PrintRequestStatus;
};

export enum PrintRequestStatus {
  PENDING = "Pending",
  COMPLETED = "Completed",
  REJECTED = "Rejected",
}
