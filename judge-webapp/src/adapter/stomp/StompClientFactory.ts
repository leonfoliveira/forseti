import { AuthorizationService } from "@/core/service/AuthorizationService";
import { ListenerClientFactory } from "@/core/listener/ListenerFactory";
import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { StompClient } from "@/adapter/stomp/StompClient";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

export class StompClientFactory implements ListenerClientFactory {
  constructor(
    private readonly wsUrl: string,
    private readonly authorizationService: AuthorizationService,
  ) {}

  public create(): ListenerClient {
    const socket = new SockJS(this.wsUrl);
    const client = Stomp.over(socket);
    client.debug = () => {};
    return new StompClient(client, this.authorizationService);
  }
}
