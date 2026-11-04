import { Router, type Request, type Response } from 'express';
import { prisma } from '../data';
import type { ApiError, CreateReadingBody } from '../types';

export const readingsRouter = Router();

readingsRouter.get('/', async (_req: Request, res: Response) => {
  const readings = await prisma.reading.findMany({
    include: {
      creator: true,
      _count: { select: { annotations: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(readings);
});

readingsRouter.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const reading = await prisma.reading.findUnique({
    where: { id: req.params.id },
    include: {
      creator: true,
      annotations: {
        include: { author: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!reading) {
    res.status(404).json({ error: 'Reading not found' });
    return;
  }

  // Build tree from flat list to support unlimited nesting depth
  const byId = new Map(reading.annotations.map((a) => [a.id, { ...a, replies: [] as any[] }]));
  const roots: any[] = [];
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.replies.push(node);
    } else if (!node.parentId) {
      roots.push(node);
    }
  }
  roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ ...reading, annotations: roots });
});

readingsRouter.post('/', async (req: Request<{}, unknown, CreateReadingBody>, res: Response) => {
  const { title, description, createdBy } = req.body;

  if (!title?.trim() || !description?.trim()) {
    res.status(400).json({ error: 'Title and description are required' });
    return;
  }

  const reading = await prisma.reading.create({
    data: { title: title.trim(), description: description.trim(), createdBy },
    include: {
      creator: true,
      _count: { select: { annotations: true } },
    },
  });

  res.status(201).json(reading);
});

readingsRouter.get('/:id/stats', async (req: Request<{ id: string }>, res: Response) => {
  const reading = await prisma.reading.findUnique({
    where: { id: req.params.id },
    include: {
      annotations: { select: { authorId: true } },
      _count: { select: { annotations: true } },
    },
  });

  if (!reading) {
    res.status(404).json({ error: 'Reading not found' });
    return;
  }

  const uniqueStudents = new Set(reading.annotations.map((a) => a.authorId)).size;

  res.json({
    readingId: reading.id,
    annotationCount: reading._count.annotations,
    uniqueStudents,
  });
});
