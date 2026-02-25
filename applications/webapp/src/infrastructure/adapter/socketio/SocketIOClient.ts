import { io, Socket } from "socket.io-client";

import { BroadcastClient } from "@/core/port/driven/broadcast/BroadcastClient";
import { BroadcastRoom } from "@/core/port/driven/broadcast/BroadcastRoom";

export class SocketIOBroadcastClient implements BroadcastClient {
  constructor(private url: string) {}

  private client: Socket | null = null;

  get isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  async connect(onConnectionLost?: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = io(this.url, {
        withCredentials: true,
      });

      this.client.on("connect", () => {
        console.log("Connected to Socket.IO server");
        this.client?.emit("authenticate");
      });

      this.client.on("ready", () => {
        console.log("Socket.IO connection is ready");
        resolve();
      });

      this.client.on("disconnect", () => {
        console.log("Lost connection to Socket.IO server");
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
    return new Promise((resolve, reject) => {
      if (!this.client || !this.client.connected) {
        reject(new Error("Not connected to Socket.IO server"));
        return;
      }

      this.client.on("disconnect", () => {
        console.log("Disconnected from Socket.IO server");
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

    for (const [event, callback] of Object.entries(room.callbacks)) {
      this.client.on(event, callback);
    }
  }
}
