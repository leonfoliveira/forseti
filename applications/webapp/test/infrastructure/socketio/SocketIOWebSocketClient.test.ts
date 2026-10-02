import { io, Socket } from "socket.io-client";

import { SocketIOWebSocketClient } from "@/infrastructure/socketio/SocketIOWebSocketClient";
import { WebSocketRoom } from "@/port/output/websocket/WebSocketRoom";

jest.mock("socket.io-client", () => ({ io: jest.fn() }));

const listeners = new Map<string, (...args: unknown[]) => void>();
type TestSocket = {
  connected: boolean;
  on: jest.Mock;
  emit: jest.Mock;
  disconnect: jest.Mock;
  removeAllListeners: jest.Mock;
};
const socket: TestSocket = {
  connected: false,
  on: jest.fn((event: string, callback: (...args: unknown[]) => void) => {
    listeners.set(event, callback);
    return socket;
  }),
  emit: jest.fn(),
  disconnect: jest.fn(() => {
    socket.connected = false;
    listeners.get("disconnect")?.();
  }),
  removeAllListeners: jest.fn(() => listeners.clear()),
};

jest.mocked(io).mockReturnValue(socket as unknown as Socket);

const trigger = (event: string, ...args: unknown[]) => {
  listeners.get(event)?.(...args);
};

describe("SocketIOWebSocketClient", () => {
  beforeEach(() => {
    listeners.clear();
    socket.connected = false;
    socket.on.mockClear();
    socket.emit.mockClear();
    socket.disconnect.mockClear();
    socket.removeAllListeners.mockClear();
  });

  it("connects with reconnection enabled and reports its state", async () => {
    const client = new SocketIOWebSocketClient("https://socket.example.test");
    const connecting = client.connect();
    socket.connected = true;
    trigger("connect");

    await expect(connecting).resolves.toBeUndefined();
    expect(client.isConnected).toBe(true);
    expect(io).toHaveBeenCalledWith(
      "https://socket.example.test",
      expect.objectContaining({
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
      }),
    );
  });

  it("rejects when the initial connection reports an error", async () => {
    const client = new SocketIOWebSocketClient("https://socket.example.test");
    const connecting = client.connect();
    const error = new Error("connection refused");

    trigger("connect_error", error);

    await expect(connecting).rejects.toBe(error);
  });

  it("joins rooms, registers callbacks, and rejoins after reconnect", async () => {
    const client = new SocketIOWebSocketClient("https://socket.example.test");
    const connecting = client.connect();
    socket.connected = true;
    trigger("connect");
    await connecting;
    const callback = jest.fn();
    const room: WebSocketRoom<{ message: (payload: string) => void }> = {
      name: "contest-room",
      callbacks: { message: callback },
    };

    await client.join(room);
    trigger("joined", room.name);
    trigger("disconnect");
    trigger("connect");

    expect(socket.emit).toHaveBeenCalledWith("join", room.name);
    expect(socket.emit).toHaveBeenCalledWith("sync", {
      room: room.name,
      timestamp: expect.any(String),
    });
    expect(socket.on).toHaveBeenCalledWith("message", callback);
  });

  it("rejects attempts to join while disconnected", async () => {
    const client = new SocketIOWebSocketClient("https://socket.example.test");
    const room: WebSocketRoom<{ message: () => void }> = {
      name: "contest-room",
      callbacks: { message: jest.fn() },
    };

    await expect(client.join(room)).rejects.toThrow(
      "Not connected to Socket.IO server",
    );
  });
});
