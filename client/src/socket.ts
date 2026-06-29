import { io, Socket } from "socket.io-client";

// Priority:
// 1. explicit VITE_SERVER_URL (two-service deployments)
// 2. dev mode -> the local server on :3001
// 3. production single-service -> same origin (server serves the client)
const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  (import.meta.env.DEV ? `http://${location.hostname}:3001` : location.origin);

export const socket: Socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

// Promise-based emit using socket.io acknowledgements.
export function emit<T = any>(event: string, payload?: any): Promise<T> {
  return new Promise((resolve) => {
    socket.emit(event, payload, (res: T) => resolve(res));
  });
}
