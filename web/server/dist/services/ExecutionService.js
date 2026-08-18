"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionService = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// For now we use the process, later this will be replaced with WASM execution
const MPL_BIN = path.resolve(__dirname, '../../../../build/mpl');
class ExecutionService {
    static formatOutput(str) {
        let clean = str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
        clean = clean.replace(/Input \[\d+\]:\s*/g, '');
        clean = clean.replace(/\s*(Output\[\d+\]:)\s*/g, '\n$1 ');
        return clean.trim();
    }
    static async executeCode(code) {
        return new Promise((resolve) => {
            if (!code) {
                resolve({ stdout: '', stderr: '', error: 'No code provided' });
                return;
            }
            const tempFile = path.join(__dirname, `temp_${Date.now()}.mpl`);
            fs.writeFileSync(tempFile, code);
            (0, child_process_1.execFile)(MPL_BIN, [tempFile], (error, stdout, stderr) => {
                if (fs.existsSync(tempFile)) {
                    fs.unlinkSync(tempFile);
                }
                resolve({
                    stdout: stdout || "",
                    stderr: stderr || "",
                    error: error ? error.message : null
                });
            });
        });
    }
    static spawnRepl() {
        // Use stdbuf to disable stdout buffering so the WebSocket gets immediate feedback
        return (0, child_process_1.spawn)('stdbuf', ['-o0', '-e0', MPL_BIN]);
    }
}
exports.ExecutionService = ExecutionService;
