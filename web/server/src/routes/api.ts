import { Router, Request, Response } from 'express';
import { ExecutionService } from '@/services/ExecutionService';
import * as fs from 'fs';
import * as path from 'path';

import { rateLimiter } from '@/middlewares/rateLimiter';

const router = Router();
const SAMPLES_DIR = path.resolve(__dirname, '../../../../samples');

router.post('/run', rateLimiter, async (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'errors.noCodeProvided' });
  }

  try {
    const result = await ExecutionService.executeCode(code);
    res.json(result);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'errors.serverError' });
  }
});

router.get('/samples', (req: Request, res: Response) => {
  fs.readdir(SAMPLES_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read samples directory' });
    }
    const mplFiles = files
      .filter((f) => f.endsWith('.mpl'))
      .sort((a, b) => {
        const numA = parseInt(a.split('-')[0]) || 0;
        const numB = parseInt(b.split('-')[0]) || 0;
        return numA - numB;
      });
    res.json({ samples: mplFiles });
  });
});

router.get('/samples/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename as string;
  const filePath = path.join(SAMPLES_DIR, filename);
  // Path traversal protection
  if (!filePath.startsWith(SAMPLES_DIR)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ content: data });
  });
});

export default router;
