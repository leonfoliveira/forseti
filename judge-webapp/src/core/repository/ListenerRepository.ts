import { ListenerClient } from "@/core/domain/model/ListenerClient";

export interface ListenerRepository {
  get(): Promise<ListenerClient>;
}
