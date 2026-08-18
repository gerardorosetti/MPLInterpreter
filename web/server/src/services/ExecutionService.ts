import { execFile, spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// For now we use the process, later this will be replaced with WASM execution
const MPL_BIN = path.resolve(__dirname, '../../../../build/mpl');

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  error: string | null;
}

export interface IExecutor {
  executeCode(code: string): Promise<ExecutionResult>;
  spawnRepl(): ChildProcess | unknown; // 'unknown' for WASM compatibility later
}

export class NativeCppExecutor implements IExecutor {
  async executeCode(code: string): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      if (!code) {
        resolve({ stdout: '', stderr: '', error: 'No code provided' });
        return;
      }

      const tempFile = path.join(__dirname, `temp_${Date.now()}.mpl`);
      fs.writeFileSync(tempFile, code);

      execFile(MPL_BIN, [tempFile], (error, stdout, stderr) => {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
        resolve({
          stdout: stdout || '',
          stderr: stderr || '',
          error: error ? error.message : null,
        });
      });
    });
  }

  spawnRepl(): ChildProcess {
    // Use stdbuf to disable stdout buffering so the WebSocket gets immediate feedback
    return spawn('stdbuf', ['-o0', '-e0', MPL_BIN]);
  }
}

export class WasmExecutor implements IExecutor {
  async executeCode(_code: string): Promise<ExecutionResult> {
    // TODO: Implement WASM execution
    return { stdout: '', stderr: '', error: 'WASM executor not implemented yet' };
  }

  spawnRepl(): unknown {
    // TODO: Implement WASM REPL stream
    throw new Error('WASM REPL not implemented yet');
  }
}

export class ExecutionService {
  static executor: IExecutor = new NativeCppExecutor();

  static formatOutput(str: string): string {
    let clean = str.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
      '',
    );
    clean = clean.replace(/Input \[\d+\]:\s*/g, '');
    clean = clean.replace(/\s*(Output\[\d+\]:)\s*/g, '\n$1 ');
    return clean.trim();
  }

  static async executeCode(code: string): Promise<ExecutionResult> {
    return this.executor.executeCode(code);
  }

  static spawnRepl(): ChildProcess | unknown {
    return this.executor.spawnRepl();
  }
}
