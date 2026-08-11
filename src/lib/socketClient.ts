import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/axiosClient";
import type { AppNotification } from "@/services/notificationService";

let socket: Socket | null = null;

/** Connect once, join the user's room, and stream live notifications. */
export function connectNotifications(
  userId: number,
  onNotification: (n: AppNotification) => void,
  onBroadcast: () => void,
) {
  if (socket) socket.disconnect();
  socket = io(API_BASE_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
  });

  socket.on("connect", () => socket?.emit("join", userId));
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
