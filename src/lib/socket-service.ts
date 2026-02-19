import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

class SocketService {
  private socket: Socket | null = null;
  private namespace = "/events";

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(`${SOCKET_URL}${this.namespace}`, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {});

    this.socket.on("disconnect", () => {});

    this.socket.on("connect_error", (error) => {});
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
    return () => this.socket?.off(event, callback);
  }

  joinRoom(room: string) {
    this.emit("join_room", room);
  }

  leaveRoom(room: string) {
    this.emit("leave_room", room);
  }

  get isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
