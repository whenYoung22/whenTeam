import axios from "axios";
import { useEffect } from "react";

import { refreshAccessToken } from "@/service/apiClient";

import { clearAuthToken, getAuthToken } from "@/utils/authToken";

import { notifyNotificationsChanged } from "@/utils/notificationEvents";

const maxReconnectDelayMs = 30_000;

// 从 HTTP base 推导 WS 地址
function getWebSocketUrl(): string {
  const apiUrl = new URL(
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
    window.location.href,
  );
  apiUrl.protocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
  apiUrl.pathname = "/ws";
  apiUrl.search = "";
  apiUrl.hash = "";
  return apiUrl.toString();
}

// 运行时消息校验
function isMessage(
  value: unknown,
): value is { type: "ready" | "notification.created" } {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    (value.type === "ready" || value.type === "notification.created")
  );
}

export default function useNotificationWebSocket(): void {
  useEffect(() => {
    let stopped = false;                         // 卸载/登录失效后停止一切重连
    let refreshTokenBeforeReconnect = false;     // 下次连接前是否先刷新 token
    let reconnectAttempts = 0;                   // 指数退避计数
    let reconnectTimer: number | undefined;      // 重连定时器
    let currentSocket: WebSocket | null = null;

    // 指数退避
    const scheduleReconnect = () => {
      if (stopped || reconnectTimer !== undefined) return;

      const delay = Math.min(
        1_000 * 2 ** reconnectAttempts,
        maxReconnectDelayMs,
      );
      reconnectAttempts += 1;
      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = undefined;
        void connect();
      }, delay);
    };

    // 核心
    const connect = async () => {
      if (stopped) return;

      // 重连前按需刷新 token
      if (refreshTokenBeforeReconnect) {
        try {
          await refreshAccessToken();
          refreshTokenBeforeReconnect = false;
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            stopped = true;
            clearAuthToken();
            window.location.replace("/login");
            return;
          }
          scheduleReconnect();
          return;
        }
      }

      //  取 token，没有就不连
      const token = getAuthToken();
      if (!token) return;

      // 建立连接 + open 时认证
      const socket = new WebSocket(getWebSocketUrl());
      currentSocket = socket;

      // message 处理
      socket.addEventListener(
        "open",
        () => {
          socket.send(JSON.stringify({ type: "auth", token }));
        },
        { once: true },
      );

      socket.addEventListener("message", (event: MessageEvent<unknown>) => {
        if (typeof event.data !== "string") return;

        let message: unknown;
        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }

        if (!isMessage(message)) return;
        if (message.type === "ready") reconnectAttempts = 0; // 认证成功 → 重置退避
        notifyNotificationsChanged();                        // 两种消息都触发外部刷新
      });

      //  close 处理
      socket.addEventListener(
        "close",
        (event) => {
          if (currentSocket === socket) currentSocket = null;
          if (event.code === 4_401) refreshTokenBeforeReconnect = true;
          scheduleReconnect();
        },
        { once: true },
      );
    };

    void connect();

    // 卸载时清理
    return () => {
      stopped = true;
      if (reconnectTimer !== undefined) {
        window.clearTimeout(reconnectTimer);
      }
      currentSocket?.close(1000, "Client disconnected");
    };
  }, []);
}
