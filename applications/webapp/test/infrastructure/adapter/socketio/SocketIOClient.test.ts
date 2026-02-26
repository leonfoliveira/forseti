import { SocketIOBroadcastClient } from "@/infrastructure/adapter/socketio/SocketIOClient";

jest.mock("socket.io-client", () => ({
  ...jest.requireActual("socket.io-client").Socket,
  io: jest.fn(),
}));

describe("SocketIOClient", () => {
  const url = "ws://localhost:8081";

  describe("connect", () => {
    test("should connect successfully", async () => {
      const client = {
        on: jest.fn(),
      };
      client.on.mockImplementation((event, callback) => {
        if (event === "connect") {
          callback();
        }
      });
      jest.spyOn(require("socket.io-client"), "io").mockReturnValue(client);
      const sut = new SocketIOBroadcastClient(url);

      expect(sut.connect).not.toThrow();
    });

    test("should handle disconnection", async () => {
      const onDisconnect = jest.fn();
      const client = {
        on: jest.fn(),
        disconnect: jest.fn(),
      };
      client.on.mockImplementation((event, callback) => {
        if (event === "ready") {
          callback();
        }
        if (event === "disconnect") {
          callback();
        }
      });
      jest.spyOn(require("socket.io-client"), "io").mockReturnValue(client);
      const sut = new SocketIOBroadcastClient(url);

      await sut.connect(onDisconnect);

      expect(onDisconnect).toHaveBeenCalled();
      expect(sut.isConnected).toBe(false);
    });

    test("should handle connection error", async () => {
      const error = new Error("Connection failed");
      const client = {
        on: jest.fn(),
      };
      client.on.mockImplementation((event, callback) => {
        if (event === "connect_error") {
          callback(error);
        }
      });
      jest.spyOn(require("socket.io-client"), "io").mockReturnValue(client);
      const sut = new SocketIOBroadcastClient(url);

      await expect(sut.connect()).rejects.toThrow("Connection failed");
    });

    test("should handle connection timeout", async () => {
      const timeout = 5000;
      const client = {
        on: jest.fn(),
      };
      client.on.mockImplementation((event, callback) => {
        if (event === "connect_timeout") {
          callback(timeout);
        }
      });
      jest.spyOn(require("socket.io-client"), "io").mockReturnValue(client);
      const sut = new SocketIOBroadcastClient(url);

      await expect(sut.connect()).rejects.toThrow("Connection timeout");
    });

    test("should handle reconnect", async () => {
      const onReconnect = jest.fn();
      const client = {
        on: jest.fn(),
      };
      client.on.mockImplementation((event, callback) => {
        if (event === "ready") {
          callback();
        }
        if (event === "reconnect") {
          callback();
        }
      });
      jest.spyOn(require("socket.io-client"), "io").mockReturnValue(client);
      const sut = new SocketIOBroadcastClient(url);

      await sut.connect(undefined, onReconnect);

      expect(onReconnect).toHaveBeenCalled();
    });
  });

  describe("disconnect", () => {
    test("should do nothing if not connected", async () => {
      const sut = new SocketIOBroadcastClient(url);

      await expect(sut.disconnect()).resolves.toBeUndefined();
    });

    test("should disconnect successfully", async () => {
      const client = {
        on: jest.fn(),
        disconnect: jest.fn(),
        connected: true,
      };
      client.on.mockImplementation((event, callback) => {
        if (event === "ready") {
          callback();
        }
        if (event === "disconnect") {
          callback();
        }
      });
      jest.spyOn(require("socket.io-client"), "io").mockReturnValue(client);
      const sut = new SocketIOBroadcastClient(url);

      await sut.connect();
      await sut.disconnect();

      expect(client.disconnect).toHaveBeenCalled();
    });
  });

  describe("join", () => {
    test("should throw error when joining without connection", async () => {
      const sut = new SocketIOBroadcastClient(url);
      const topic = {
        name: "test-topic",
        callbacks: {},
      };

      await expect(sut.join(topic)).rejects.toThrow(
        "Not connected to Socket.IO server",
      );
    });

    test("should join successfully", async () => {
      const client = {
        on: jest.fn(),
        emit: jest.fn(),
        connected: true,
      };
      client.on.mockImplementation((event, callback) => {
        if (event === "ready") {
          callback();
        }
      });
      jest.spyOn(require("socket.io-client"), "io").mockReturnValue(client);
      const sut = new SocketIOBroadcastClient(url);
      const topic = {
        name: "test-topic",
        callbacks: {
          ANNOUNCEMENT_CREATED: jest.fn(),
        },
      };

      await sut.connect();
      await sut.join(topic);

      expect(client.emit).toHaveBeenCalledWith("join", topic.name);
    });
  });
});
