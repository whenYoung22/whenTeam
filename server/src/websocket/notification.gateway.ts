import type { Server as HttpServer } from "node:http";
import { WebSocket, WebSocketServer } from "ws";

import { verifyAccessToken } from "../utils/access-token.util.js";
import { getClientOrigins } from "../utils/client-origins.util.js";

const authenticationTimeoutMs = 5_000;
const authenticationRequiredCloseCode = 4_401;
const invalidMessageCloseCode = 4_400;
const connectionsByUserId = new Map<number, Set<WebSocket>>();

type ClientMessage = {
  type: "auth";
  token: string;
};

type ServerMessage =
  | { type: "ready" }
  | { type: "notification.created" };

function isClientMessage(value: unknown): value is ClientMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "auth" &&
    "token" in value &&
    typeof value.token === "string" &&
    value.token.length > 0
  );
}

export function createNotificationWebSocketServer(
  httpServer: HttpServer,
): WebSocketServer {
  const userIdByConnection = new WeakMap<WebSocket, number>();
  const authenticatingConnections = new WeakSet<WebSocket>();

  const webSocketServer = new WebSocketServer({
    server: httpServer,
    path: "/ws",
    maxPayload: 1_024,
    perMessageDeflate: false,
    verifyClient: ({ origin }, callback) => {
      const allowedOrigins = getClientOrigins();
      const allowed = !origin || allowedOrigins.includes(origin);
      callback(allowed, allowed ? undefined : 403, "Origin not allowed");
    },
  });

  webSocketServer.on("connection", (socket) => {
    const authenticationTimeout = setTimeout(() => {
      if (!userIdByConnection.has(socket)) {
        socket.close(authenticationRequiredCloseCode, "Authentication required");
      }
    }, authenticationTimeoutMs);

    socket.on("message", (data) => {
      if (
        userIdByConnection.has(socket) ||
        authenticatingConnections.has(socket)
      ) {
        socket.close(invalidMessageCloseCode, "Unexpected message");
        return;
      }

      let message: unknown;
      try {
        message = JSON.parse(data.toString());
      } catch {
        socket.close(invalidMessageCloseCode, "Invalid message");
        return;
      }

      if (!isClientMessage(message)) {
        socket.close(invalidMessageCloseCode, "Authentication required");
        return;
      }

      authenticatingConnections.add(socket);
      void verifyAccessToken(message.token)
        .then((userId) => {
          if (socket.readyState !== WebSocket.OPEN) return;

          userIdByConnection.set(socket, userId);
          const userConnections = connectionsByUserId.get(userId) ?? new Set();
          userConnections.add(socket);
          connectionsByUserId.set(userId, userConnections);

          clearTimeout(authenticationTimeout);
          socket.send(JSON.stringify({ type: "ready" } satisfies ServerMessage));
        })
        .catch(() => {
          socket.close(authenticationRequiredCloseCode, "Invalid token");
        })
        .finally(() => {
          authenticatingConnections.delete(socket);
        });
    });

    socket.on("error", (error) => {
      console.error("Notification WebSocket connection error:", error);
    });

    socket.on("close", () => {
      clearTimeout(authenticationTimeout);
      const userId = userIdByConnection.get(socket);
      if (userId === undefined) return;

      const userConnections = connectionsByUserId.get(userId);
      userConnections?.delete(socket);
      if (userConnections?.size === 0) {
        connectionsByUserId.delete(userId);
      }
    });
  });

  return webSocketServer;
}

export function publishNotificationChanges(receiverIds: number[]): void {
  if (receiverIds.length === 0) return;

  const payload = JSON.stringify({
    type: "notification.created",
  } satisfies ServerMessage);

  for (const receiverId of new Set(receiverIds)) {
    const connections = connectionsByUserId.get(receiverId);
    if (!connections) continue;

    for (const socket of connections) {
      if (socket.readyState !== WebSocket.OPEN) continue;

      try {
        socket.send(payload, (error) => {
          if (error) {
            console.error("Failed to send notification WebSocket event:", error);
            socket.terminate();
          }
        });
      } catch (error) {
        console.error("Failed to send notification WebSocket event:", error);
        socket.terminate();
      }
    }
  }
}
