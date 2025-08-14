import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import { StompClient } from "@/adapter/stomp/StompClient";
import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { ListenerClientFactory } from "@/core/listener/ListenerFactory";


export class StompClientFactory implements ListenerClientFactory {
  constructor(private readonly wsUrl: string) {}

  public create(): ListenerClient {
    const socket = new SockJS(this.wsUrl);
    const client = Stomp.over(socket);
    client.debug = () => {};
    return new StompClient(client);
  }
}
