import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";

export type WithStatus<T> = T & {
  status: ContestStatus;
};
