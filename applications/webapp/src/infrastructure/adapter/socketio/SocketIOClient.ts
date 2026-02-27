import { io, Socket } from "socket.io-client";

import { BroadcastClient } from "@/core/port/driven/broadcast/BroadcastClient";
import { BroadcastRoom } from "@/core/port/driven/broadcast/BroadcastRoom";

export class SocketIOBroadcastClient implements BroadcastClient {
  constructor(private url: string) {}

  private client: Socket | null = null;
  private rooms: Map<string, { [event: string]: (payload: any) => void }> =
    new Map();
  private lastConnectionLostAt: Date | null = null;

  get isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  async connect(
    onConnectionLost?: () => void,
    onReconnect?: () => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = io(this.url, {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.client.on("connect", () => {
        if (this.client?.recovered) {
          this.restoreConnection(this.client);
          onReconnect?.();
        } else {
          console.debug("Connected to Socket.IO server");
          this.client?.emit("authenticate");
        }
      });

      this.client.on("ready", () => {
        console.debug("Socket.IO server is ready");
        resolve();
      });

      this.client.on("disconnect", () => {
        console.debug("Lost connection to Socket.IO server");
        onConnectionLost?.();
      });

      this.client.on("connect_error", (error) => {
        console.error("Connection error:", error);
        reject(error);
      });

      this.client.on("connect_timeout", (timeout) => {
        console.error("Connection timeout:", timeout);
        reject(new Error("Connection timeout"));
      });

      this.client.on("error", (error) => {
        console.error(error);
      });

      setTimeout(() => {
        if (!this.client?.connected) {
          console.error("Connection timeout");
          reject(new Error("Connection timeout"));
        }
      }, 5000);
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.client || !this.client.connected) {
        console.debug("Already disconnected");
        return resolve();
      }

      this.client.on("disconnect", () => {
        console.debug("Disconnected from Socket.IO server");
        resolve();
      });

      this.client.disconnect();
    });
  }

  async join<TCallbacks extends { [event: string]: (payload: any) => void }>(
    room: BroadcastRoom<TCallbacks>,
  ): Promise<void> {
    if (!this.client || !this.client.connected) {
      throw new Error("Not connected to Socket.IO server");
    }

    this.client.emit("join", room.name);
    this.rooms.set(room.name, room.callbacks);

    for (const [event, callback] of Object.entries(room.callbacks)) {
      this.client.on(event, callback);
    }
  }

  /**
   * Restore the connection by rejoining all rooms and resubscribing to events.
   * Emits a "sync" event for each room with the timestamp of when the connection was lost, allowing the server to send any missed messages.
   *
   * @param client The Socket.IO client instance that has reconnected to the server.
   */
  private async restoreConnection(client: Socket): Promise<void> {
    for (const [room, callbacks] of this.rooms.entries()) {
      await this.join({ name: room, callbacks });
      if (this.lastConnectionLostAt) {
        client.emit("sync", {
          room,
          timestamp: this.lastConnectionLostAt.toISOString(),
        });
      }
    }
  }
}
