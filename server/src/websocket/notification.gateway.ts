// 需要鉴权的通知推送 WebSocket 网关； 客户端连上后必须先发一条含 token 的认证消息，认证通过才能收到通知推送
import type { Server as HttpServer } from "node:http";
import { WebSocket, WebSocketServer } from "ws";

import { verifyAccessToken } from "../utils/access-token.util.js";
import { getClientOrigins } from "../utils/client-origins.util.js";

const authenticationTimeoutMs = 5_000;  // 未认证连接最多存活 5 秒
const authenticationRequiredCloseCode = 4_401;  // 未认证 / token 无效
const invalidMessageCloseCode = 4_400;   // 消息格式错误

// 每条连接对应一个客户端实例，一个用户可以有多个客户端实例
// 全局连接表 connectionsByUserId，把"用户"和"他的多条 WebSocket 连接"关联起来，业务侧只要给 userId 就能推送
const connectionsByUserId = new Map<number, Set<WebSocket>>(); 

type ClientMessage = {
  type: "auth";
  token: string;
};

type ServerMessage =
  | { type: "ready" }
  | { type: "notification.created" };

// 消息校验函数
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
  // 记录"这条连接认证后属于哪个 userId"。用 WeakMap 是因为连接关闭后 key 对象不可达，自动回收，不会内存泄漏
  const userIdByConnection = new WeakMap<WebSocket, number>(); 

  // 标记"正在认证中"的连接，防止异步校验期间客户端再发消息造成重复认证
  const authenticatingConnections = new WeakSet<WebSocket>();

  // 创建 WebSocketServer
  const webSocketServer = new WebSocketServer({
    server: httpServer,                 // 复用 HTTP server，同端口
    path: "/ws",                       // 只处理 /ws 路径的 upgrade
    maxPayload: 1_024,                // 单条消息最大 1KB，防大包攻击
    perMessageDeflate: false,        // 关闭压缩，省 CPU、避免压缩炸弹
    verifyClient: ({ origin }, callback) => {
      const allowedOrigins = getClientOrigins();
      const allowed = !origin || allowedOrigins.includes(origin);
      callback(allowed, allowed ? undefined : 403, "Origin not allowed");
    },
  });

  // connection 处理：认证超时
  webSocketServer.on("connection", (socket) => {
    const authenticationTimeout = setTimeout(() => {
      if (!userIdByConnection.has(socket)) {
        socket.close(authenticationRequiredCloseCode, "Authentication required");
      }
    }, authenticationTimeoutMs);

    // 消息处理
    socket.on("message", (data) => {
      // ① 已认证 或 正在认证中 → 再发消息就是异常
      if (
        userIdByConnection.has(socket) ||
        authenticatingConnections.has(socket)
      ) {
        socket.close(invalidMessageCloseCode, "Unexpected message");
        return;
      }

      // ② 解析 JSON
      let message: unknown;
      try {
        message = JSON.parse(data.toString());
      } catch {
        socket.close(invalidMessageCloseCode, "Invalid message");
        return;
      }

      // ③ 结构校验
      if (!isClientMessage(message)) {
        socket.close(invalidMessageCloseCode, "Authentication required");
        return;
      }

      // ④ 标记认证中，异步校验 token
      authenticatingConnections.add(socket);
      void verifyAccessToken(message.token)
        .then((userId) => {
          if (socket.readyState !== WebSocket.OPEN) return;

          userIdByConnection.set(socket, userId);  // 这条连接属于谁
          const userConnections = connectionsByUserId.get(userId) ?? new Set();
          userConnections.add(socket);  // 用户 → 他的连接集合
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


// 推送函数 
export function publishNotificationChanges(receiverIds: number[]): void {
  if (receiverIds.length === 0) return;

  const payload = JSON.stringify({
    type: "notification.created",
  } satisfies ServerMessage);

  // 去重
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
