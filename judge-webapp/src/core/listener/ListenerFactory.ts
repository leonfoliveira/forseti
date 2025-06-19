import { ListenerClient } from "@/core/domain/model/ListenerClient";

export interface ListenerClientFactory {
  create(): ListenerClient;
}
