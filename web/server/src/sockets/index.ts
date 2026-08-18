import { Server, Socket } from 'socket.io';
import { ExecutionService } from '@/services/ExecutionService';
import { ChildProcess } from 'child_process';

import { SocketEvent } from '@/constants/socketEvents';

export const setupSockets = (io: Server) => {
  io.on(SocketEvent.SERVER_CONNECTION, (socket: Socket) => {
    let mplProcess: ChildProcess | null = ExecutionService.spawnRepl() as ChildProcess;

    let stdoutBuffer = '';
    let stdoutTimeout: NodeJS.Timeout | null = null;
    const flushStdout = () => {
      if (!stdoutBuffer) return;
      socket.emit(SocketEvent.OUTPUT, ExecutionService.formatOutput(stdoutBuffer));
      stdoutBuffer = '';
    };

    if (mplProcess && mplProcess.stdout) {
      mplProcess.stdout.on('data', (data) => {
        stdoutBuffer += data.toString();
        if (stdoutTimeout) clearTimeout(stdoutTimeout);
        stdoutTimeout = setTimeout(flushStdout, 50);
      });
    }

    let stderrBuffer = '';
    let stderrTimeout: NodeJS.Timeout | null = null;
    const flushStderr = () => {
      if (!stderrBuffer) return;
      socket.emit(SocketEvent.ERROR_OUTPUT, ExecutionService.formatOutput(stderrBuffer));
      stderrBuffer = '';
    };

    if (mplProcess && mplProcess.stderr) {
      mplProcess.stderr.on('data', (data) => {
        stderrBuffer += data.toString();
        if (stderrTimeout) clearTimeout(stderrTimeout);
        stderrTimeout = setTimeout(flushStderr, 50);
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
