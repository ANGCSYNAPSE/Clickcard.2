import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/axiosClient";
import type { AppNotification } from "@/services/notificationService";

let socket: Socket | null = null;

/** Connect once, join the user's room, and stream live notifications.
 * When the backend is hosted on serverless platforms (like Vercel) that do not
 * support persistent WebSockets, we limit retries to avoid flooding the console. */
export function connectNotifications(
  userId: number,
  onNotification: (n: AppNotification) => void,
  onBroadcast: () => void,
) {
  if (socket) socket.disconnect();

  socket = io(API_BASE_URL, {
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: 2,
    reconnectionDelay: 10000,
    timeout: 5000,
    autoConnect: true,
  });

  socket.on("connect", () => {
    socket?.emit("join", userId);
  });

  socket.on("connect_error", () => {
    // Vercel serverless backend does not support WebSockets; silently fail after max attempts
  });

  socket.on("notification", (payload: AppNotification & { broadcast?: boolean }) => {
    if (payload?.broadcast) onBroadcast();
    else if (payload?.id) onNotification(payload);
  });

  return socket;
}

export function disconnectNotifications() {
  socket?.disconnect();
  socket = null;
}
