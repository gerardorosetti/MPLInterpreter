"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const index_1 = require("./index");
// Mock ExecutionService to not actually spawn processes during tests
vitest_1.vi.mock('./services/ExecutionService', () => {
    return {
        ExecutionService: {
            executeCode: vitest_1.vi.fn(async (code) => {
                if (code === 'error') {
                    return { stdout: '', stderr: '', error: 'Simulated error' };
                }
                return { stdout: 'Mocked output', stderr: '', error: null };
            }),
            spawnRepl: vitest_1.vi.fn(() => ({
                stdout: { on: vitest_1.vi.fn() },
                stderr: { on: vitest_1.vi.fn() },
                on: vitest_1.vi.fn(),
                stdin: { write: vitest_1.vi.fn() },
                kill: vitest_1.vi.fn()
            }))
        }
    };
});
(0, vitest_1.describe)('MPL Backend API', () => {
    (0, vitest_1.it)('GET /api/samples should return a list of samples', async () => {
        const res = await (0, supertest_1.default)(index_1.app).get('/api/samples');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toHaveProperty('samples');
        (0, vitest_1.expect)(Array.isArray(res.body.samples)).toBe(true);
    });
    (0, vitest_1.it)('POST /api/run should execute code and return output', async () => {
        const res = await (0, supertest_1.default)(index_1.app)
            .post('/api/run')
            .send({ code: 'print(2+2);' });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.stdout).toBe('Mocked output');
    });
    (0, vitest_1.it)('POST /api/run should fail if no code is provided', async () => {
        const res = await (0, supertest_1.default)(index_1.app)
            .post('/api/run')
            .send({});
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.error).toBe('No code provided');
    });
    (0, vitest_1.it)('POST /api/run should return error gracefully if execution fails', async () => {
        const res = await (0, supertest_1.default)(index_1.app)
            .post('/api/run')
            .send({ code: 'error' });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.error).toBe('Simulated error');
    });
});
