import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";

export interface ListenerRepository {
  open(): Promise<ListenerClient>;
}
