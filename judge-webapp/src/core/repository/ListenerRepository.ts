import { ListenerClient } from "@/core/domain/model/ListenerClient";

export interface ListenerRepository {
  open(): Promise<ListenerClient>;
}
