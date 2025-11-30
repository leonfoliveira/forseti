import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";

export interface ListenerClientFactory {
  /**
   * Create a new ListenerClient instance.
   *
   * @returns A new ListenerClient.
   */
  create(): ListenerClient;
}
