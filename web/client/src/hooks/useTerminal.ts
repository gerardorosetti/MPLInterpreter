/**
 * @file useTerminal.ts
 * @description Custom hook to manage WebSocket terminal state and logic.
 */

import { useState, useEffect, useRef } from 'react';
import { socketService } from '@/services/socket';
import { SocketEvent } from '@/constants/socketEvents';

/**
 * Interface representing the state of the terminal.
 */
interface TerminalState {
  history: string[];
  isConnected: boolean;
}

export const useTerminal = () => {
  const [state, setState] = useState<TerminalState>({
    history: [],
    isConnected: false,
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketService.connect();

    const handleConnect = () => {
      setState((prev) => ({
        ...prev,
        isConnected: true,
        history: [...prev.history, '[System] Connected to MPL Live Interpreter.'],
      }));
    };

    const handleDisconnect = () => {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        history: [...prev.history, '[System] Disconnected from Interpreter.'],
      }));
    };

    const handleOutput = (data: string) => {
      if (!data.trim()) return;
      setState((prev) => ({ ...prev, history: [...prev.history, data] }));
    };

    const handleError = (data: string) => {
      setState((prev) => ({ ...prev, history: [...prev.history, `[Error] ${data}`] }));
    };

    const handleClosed = (data: string) => {
      setState((prev) => ({ ...prev, history: [...prev.history, `[Closed] ${data}`] }));
    };

    socketService.onConnect(handleConnect);
    socketService.onDisconnect(handleDisconnect);
    socketService.onOutput(handleOutput);
    socketService.onErrorOutput(handleError);
    socketService.onClosed(handleClosed);

    return () => {
      socketService.off(SocketEvent.CLIENT_CONNECT);
      socketService.off(SocketEvent.DISCONNECT);
      socketService.off(SocketEvent.OUTPUT);
      socketService.off(SocketEvent.ERROR_OUTPUT);
      socketService.off(SocketEvent.CLOSED);
      socketService.disconnect();
      setState((prev) => ({ ...prev, isConnected: false }));
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.history]);

  /**
   * Sends input to the REPL and adds it to the history.
   * @param input - The input string to send.
   */
  const sendInput = (input: string) => {
    if (!input.trim()) return;
    setState((prev) => ({ ...prev, history: [...prev.history, `> ${input}`] }));
    socketService.sendInput(input);
  };

  /**
   * Clears the terminal history.
   */
  const clearTerminal = () => {
    setState((prev) => ({ ...prev, history: [] }));
  };

  return {
    ...state,
    bottomRef,
    sendInput,
    clearTerminal,
  };
};
