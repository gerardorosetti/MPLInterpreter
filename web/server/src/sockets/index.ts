import { Server, Socket } from 'socket.io';
import { ExecutionService } from '../services/ExecutionService';
import { ChildProcess } from 'child_process';

export const setupSockets = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        let mplProcess: ChildProcess | null = ExecutionService.spawnRepl();

        if (mplProcess.stdout) {
            mplProcess.stdout.on('data', (data) => {
                socket.emit('output', ExecutionService.formatOutput(data.toString()));
            });
        }

        if (mplProcess.stderr) {
            mplProcess.stderr.on('data', (data) => {
                socket.emit('error_output', ExecutionService.formatOutput(data.toString()));
            });
        }

        mplProcess.on('close', (code) => {
            socket.emit('closed', `Process exited with code ${code}`);
        });

        socket.on('input', (data: string) => {
            if (mplProcess && !mplProcess.killed && mplProcess.stdin) {
                mplProcess.stdin.write(data + '\n');
            }
        });

        socket.on('disconnect', () => {
            if (mplProcess && !mplProcess.killed) {
                mplProcess.kill();
                mplProcess = null;
            }
        });
    });
};
