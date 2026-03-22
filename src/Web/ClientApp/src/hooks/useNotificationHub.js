import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";

/**
 * Custom hook để kết nối đến NotificationHub SignalR.
 * 
 * Lắng nghe event "NewNotification" để cập nhật real-time.
 * 
 * @param {Function} onNewNotification - Callback khi nhận thông báo mới
 */
export function useNotificationHub(onNewNotification) {
  const callbackRef = useRef(onNewNotification);

  useEffect(() => {
    callbackRef.current = onNewNotification;
  }, [onNewNotification]);

  useEffect(() => {
    const baseUrl = process.env.REACT_APP_HUB_BASE_URL || "";
    const hubUrl = `${baseUrl}/hubs/notifications`;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.ServerSentEvents |
          signalR.HttpTransportType.LongPolling,
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on("NewNotification", (data) => {
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    });

    connection.start().catch((err) => {
      console.warn("[NotificationHub] Connection failed:", err.message);
    });

    return () => {
      connection.stop();
    };
  }, []);
}
