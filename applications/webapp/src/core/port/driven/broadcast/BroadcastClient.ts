import { BroadcastEvent } from "@/core/domain/enumerate/BroadcastEvent";
import { BroadcastRoom } from "@/core/port/driven/broadcast/BroadcastRoom";

export interface BroadcastClient {
  /**
   * Indicates whether the client is currently connected to the broadcast listener service.
   * */
  isConnected: boolean;

  /**
   * Connects to the broadcast listener service.
   *
   * @param onDisconnect Optional callback to be invoked when the connection is lost.
   * @returns A promise that resolves when the connection is successfully established.
   */
  connect: (onDisconnect?: () => void) => Promise<void>;

  /**
   * Disconnects from the broadcast listener service.
   *
   * @returns A promise that resolves when the disconnection is successful.
   */
  disconnect: () => Promise<void>;

  /**
   * Subscribes to a broadcast topic with the specified callbacks for each event.
   *
   * @param topic The broadcast topic to subscribe to, which includes the callbacks for each event.
   * @returns A promise that resolves when the subscription is successful.
   */
  subscribe<
    TCallbacks extends { [event in BroadcastEvent]?: (payload: any) => void },
  >(
    topic: BroadcastRoom<TCallbacks>,
  ): Promise<void>;
}
