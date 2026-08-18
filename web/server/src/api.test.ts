import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';
import { app } from './index';

// Mock ExecutionService to not actually spawn processes during tests
vi.mock('./services/ExecutionService', () => {
    return {
        ExecutionService: {
            executeCode: vi.fn(async (code: string) => {
                if (code === 'error') {
                    return { stdout: '', stderr: '', error: 'Simulated error' };
                }
                return { stdout: 'Mocked output', stderr: '', error: null };
            }),
            spawnRepl: vi.fn(() => ({
                stdout: { on: vi.fn() },
                stderr: { on: vi.fn() },
                on: vi.fn(),
                stdin: { write: vi.fn() },
                kill: vi.fn()
            }))
        }
    };
});

describe('MPL Backend API', () => {
    it('GET /api/samples should return a list of samples', async () => {
        const res = await request(app).get('/api/samples');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('samples');
        expect(Array.isArray(res.body.samples)).toBe(true);
    });

    it('POST /api/run should execute code and return output', async () => {
        const res = await request(app)
            .post('/api/run')
            .send({ code: 'print(2+2);' });
        
        expect(res.status).toBe(200);
        expect(res.body.stdout).toBe('Mocked output');
    });

    it('POST /api/run should fail if no code is provided', async () => {
        const res = await request(app)
            .post('/api/run')
            .send({});
        
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('No code provided');
    });

    it('POST /api/run should return error gracefully if execution fails', async () => {
        const res = await request(app)
            .post('/api/run')
            .send({ code: 'error' });
        
        expect(res.status).toBe(200);
        expect(res.body.error).toBe('Simulated error');
    });
});
