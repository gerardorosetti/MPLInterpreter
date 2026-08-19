import { Router, Response } from 'express';
import { prisma } from '@/services/prisma';
import { authMiddleware, AuthRequest } from '@/middlewares/authMiddleware';

const router = Router();

// GET /api/snippets - List all snippets for current user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const snippets = await prisma.snippet.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, isPublic: true, updatedAt: true },
    });
    res.json({ snippets });
  } catch (error) {
    console.error('Fetch snippets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/snippets/:id - Get a specific snippet
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const snippet = await prisma.snippet.findUnique({
      where: { id },
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    if (snippet.userId !== userId && !snippet.isPublic) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ snippet });
  } catch (error) {
    console.error('Fetch snippet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/snippets - Create or update snippet
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { title, content, isPublic } = req.body;
    const id = req.body.id as string | undefined;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    let snippet;
    if (id) {
      // Update existing
      snippet = await prisma.snippet.findUnique({ where: { id } });
      if (!snippet) return res.status(404).json({ error: 'Snippet not found' });
      if (snippet.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

      snippet = await prisma.snippet.update({
        where: { id },
        data: { title, content, isPublic: isPublic ?? snippet.isPublic },
      });
    } else {
      // Create new
      snippet = await prisma.snippet.create({
        data: {
          title,
          content,
          userId,
          isPublic: isPublic || false,
        },
      });
    }

    res.json({ snippet });
  } catch (error) {
    console.error('Save snippet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/snippets/:id - Delete snippet
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const snippet = await prisma.snippet.findUnique({ where: { id } });
    if (!snippet) return res.status(404).json({ error: 'Snippet not found' });
    if (snippet.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    await prisma.snippet.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete snippet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
