import { WebSocketRoom } from "@/port/output/websocket/WebSocketRoom";

export interface WebSocketClient {
  /**
   * Indicates whether the client is currently connected to the WebSocket server.
   * */
  isConnected: boolean;

  /**
   * Connects to the WebSocket server.
   *
   * @param onDisconnect Optional callback to be invoked when the connection is lost.
   * @param onReconnect Optional callback to be invoked when the connection is re-established after being lost.
   * @returns A promise that resolves when the connection is successfully established.
   */
  connect: (
    onDisconnect?: () => void,
    onReconnect?: () => void,
  ) => Promise<void>;

  /**
   * Disconnects from the WebSocket server.
   *
   * @returns A promise that resolves when the disconnection is successful.
   */
  disconnect: () => Promise<void>;

  /**
   * Joins a WebSocket room to start receiving real-time updates for the specified events.
   *
   * @param room The WebSocket room to join, which includes the callbacks for each event.
   * @returns A promise that resolves when the join operation is successful.
   */
  join<TCallbacks extends { [event: string]: (payload: any) => void }>(
    room: WebSocketRoom<TCallbacks>,
  ): Promise<void>;
}
