/**
 * @file socket.ts
 * @description Core WebSocket service for communicating with the MPL interactive REPL.
 */

import { io, Socket } from 'socket.io-client';
import { SocketEvent } from '../constants/socketEvents';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '/';

/**
 * Socket Service for managing WebSocket connection to the backend.
 * Encapsulates socket.io logic from React components.
 */
export class SocketService {
  private socket: Socket | null = null;

  /**
   * Connects to the WebSocket server.
   */
  connect(): void {
    if (!this.socket) {
      this.socket = io(SOCKET_URL);
    }
  }

  /**
   * Disconnects from the WebSocket server.
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Registers a callback for standard output events.
   * @param callback - Function to execute when output is received.
   */
  onOutput(callback: (data: string) => void): void {
    this.socket?.on(SocketEvent.OUTPUT, callback);
  }

  onErrorOutput(callback: (data: string) => void): void {
    this.socket?.on(SocketEvent.ERROR_OUTPUT, callback);
  }

  onClosed(callback: (data: string) => void): void {
    this.socket?.on(SocketEvent.CLOSED, callback);
  }

  onConnect(callback: () => void): void {
    this.socket?.on(SocketEvent.CLIENT_CONNECT, callback);
  }

  onDisconnect(callback: () => void): void {
    this.socket?.on(SocketEvent.DISCONNECT, callback);
  }

  off(event: SocketEvent): void {
    this.socket?.off(event);
  }

  /**
   * Sends input data to the backend REPL.
   * @param data - The input string to send.
   */
  sendInput(data: string): void {
    this.socket?.emit(SocketEvent.INPUT, data);
  }
}

// Export a singleton instance
export const socketService = new SocketService();
