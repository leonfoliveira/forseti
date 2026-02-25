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
   * Joins a broadcast room to start receiving real-time updates for the specified events.
   *
   * @param room The broadcast room to join, which includes the callbacks for each event.
   * @returns A promise that resolves when the join operation is successful.
   */
  join<TCallbacks extends { [event: string]: (payload: any) => void }>(
    room: BroadcastRoom<TCallbacks>,
  ): Promise<void>;
}
