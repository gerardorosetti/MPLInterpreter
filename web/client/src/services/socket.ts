/**
 * @file socket.ts
 * @description Core WebSocket service for communicating with the MPL interactive REPL.
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

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
        this.socket?.on('output', callback);
    }

    /**
     * Registers a callback for error output events.
     * @param callback - Function to execute when an error is received.
     */
    onErrorOutput(callback: (data: string) => void): void {
        this.socket?.on('error_output', callback);
    }

    /**
     * Registers a callback for process closure events.
     * @param callback - Function to execute when the process closes.
     */
    onClosed(callback: (data: string) => void): void {
        this.socket?.on('closed', callback);
    }

    onConnect(callback: () => void): void {
        this.socket?.on('connect', callback);
    }

    onDisconnect(callback: () => void): void {
        this.socket?.on('disconnect', callback);
    }

    off(event: string): void {
        this.socket?.off(event);
    }

    /**
     * Sends input data to the backend REPL.
     * @param data - The input string to send.
     */
    sendInput(data: string): void {
        this.socket?.emit('input', data);
    }
}

// Export a singleton instance
export const socketService = new SocketService();
