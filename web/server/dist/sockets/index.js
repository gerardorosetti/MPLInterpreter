"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSockets = void 0;
const ExecutionService_1 = require("../services/ExecutionService");
const setupSockets = (io) => {
    io.on('connection', (socket) => {
        let mplProcess = ExecutionService_1.ExecutionService.spawnRepl();
        if (mplProcess.stdout) {
            mplProcess.stdout.on('data', (data) => {
                socket.emit('output', ExecutionService_1.ExecutionService.formatOutput(data.toString()));
            });
        }
        if (mplProcess.stderr) {
            mplProcess.stderr.on('data', (data) => {
                socket.emit('error_output', ExecutionService_1.ExecutionService.formatOutput(data.toString()));
            });
        }
        mplProcess.on('close', (code) => {
            socket.emit('closed', `Process exited with code ${code}`);
        });
        socket.on('input', (data) => {
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
exports.setupSockets = setupSockets;
