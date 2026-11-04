import { Router, type Request, type Response } from 'express';
import { prisma } from '../data';
import { Errors, CreateReadingSchema, DeleteReadingSchema } from '../types';
import type { ApiError, CreateReadingBody, DeleteReadingBody } from '../types';
import { validate } from '../middleware/validate';

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
    res.status(404).json({ error: Errors.READING_NOT_FOUND });
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

readingsRouter.post(
  '/',
  validate(CreateReadingSchema),
  async (req: Request<{}, unknown, CreateReadingBody>, res: Response) => {
    const { title, description, createdBy } = req.body;

    const reading = await prisma.reading.create({
      data: { title, description, createdBy },
      include: {
        creator: true,
        _count: { select: { annotations: true } },
      },
    });

    res.status(201).json(reading);
  },
);

readingsRouter.delete(
  '/:id',
  validate(DeleteReadingSchema),
  async (req: Request<{ id: string }, unknown, DeleteReadingBody>, res: Response) => {
    const { userId } = req.body;

    const reading = await prisma.reading.findUnique({ where: { id: req.params.id } });

    if (!reading) {
      res.status(404).json({ error: Errors.READING_NOT_FOUND });
      return;
    }

    if (reading.createdBy !== userId) {
      res.status(403).json({ error: Errors.DELETE_OWN_READING_ONLY });
      return;
    }

    await prisma.annotation.deleteMany({ where: { readingId: reading.id } });
    await prisma.reading.delete({ where: { id: reading.id } });

    res.json({ success: true });
  },
);

readingsRouter.get('/:id/stats', async (req: Request<{ id: string }>, res: Response) => {
  const reading = await prisma.reading.findUnique({
    where: { id: req.params.id },
    include: {
      annotations: { select: { authorId: true } },
      _count: { select: { annotations: true } },
    },
  });

  if (!reading) {
    res.status(404).json({ error: Errors.READING_NOT_FOUND });
    return;
  }

  const uniqueStudents = new Set(reading.annotations.map((a) => a.authorId)).size;

  res.json({
    readingId: reading.id,
    annotationCount: reading._count.annotations,
    uniqueStudents,
  });
});
