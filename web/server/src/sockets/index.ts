import { Server, Socket } from 'socket.io';
import { ExecutionService } from '@/services/ExecutionService';
import { ChildProcess } from 'child_process';

import { SocketEvent } from '@/constants/socketEvents';

export const setupSockets = (io: Server) => {
  io.on(SocketEvent.SERVER_CONNECTION, (socket: Socket) => {
    let mplProcess: ChildProcess | null = ExecutionService.spawnRepl() as ChildProcess;

    if (mplProcess && mplProcess.stdout) {
      mplProcess.stdout.on('data', (data) => {
        socket.emit(SocketEvent.OUTPUT, ExecutionService.formatOutput(data.toString()));
      });
    }

    if (mplProcess && mplProcess.stderr) {
      mplProcess.stderr.on('data', (data) => {
        socket.emit(SocketEvent.ERROR_OUTPUT, ExecutionService.formatOutput(data.toString()));
      });
    }

    if (mplProcess) {
      mplProcess.on('close', (code) => {
        socket.emit(SocketEvent.CLOSED, `Process exited with code ${code}`);
      });
    }

    socket.on(SocketEvent.INPUT, (data: string) => {
      if (mplProcess && !mplProcess.killed && mplProcess.stdin) {
        mplProcess.stdin.write(data + '\n');
      }
    });

    socket.on(SocketEvent.DISCONNECT, () => {
      if (mplProcess && !mplProcess.killed) {
        mplProcess.kill();
        mplProcess = null;
      }
    });
  });
};
