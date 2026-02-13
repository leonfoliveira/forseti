import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { ListenerClientFactory } from "@/core/port/driven/listener/ListenerFactory";
import { StompClient } from "@/infrastructure/adapter/stomp/StompClient";

export class StompClientFactory implements ListenerClientFactory {
  constructor(private readonly wsUrl: string) {}

  /**
   * Create a new STOMP client connected to the configured WebSocket URL.
   *
   * @returns A new instance of ListenerClient.
   */
  public create(): ListenerClient {
    const client = Stomp.over(() => new SockJS(this.wsUrl));
    client.debug = () => {};
    return new StompClient(client);
  }
}
