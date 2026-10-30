import axios from "axios";
import { useEffect } from "react";

import { refreshAccessToken } from "@/service/apiClient";
import { clearAuthToken, getAuthToken } from "@/utils/authToken";
import { notifyNotificationsChanged } from "@/utils/notificationEvents";

const maxReconnectDelayMs = 30_000;

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
    let stopped = false;
    let refreshTokenBeforeReconnect = false;
    let reconnectAttempts = 0;
    let reconnectTimer: number | undefined;
    let currentSocket: WebSocket | null = null;

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

    const connect = async () => {
      if (stopped) return;

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

      const token = getAuthToken();
      if (!token) return;

      const socket = new WebSocket(getWebSocketUrl());
      currentSocket = socket;

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
        if (message.type === "ready") reconnectAttempts = 0;
        notifyNotificationsChanged();
      });

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

    return () => {
      stopped = true;
      if (reconnectTimer !== undefined) {
        window.clearTimeout(reconnectTimer);
      }
      currentSocket?.close(1000, "Client disconnected");
    };
  }, []);
}
