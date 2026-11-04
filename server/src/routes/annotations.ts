import { Router, type Request, type Response } from 'express';
import { prisma } from '../data';
import type { ApiError, CreateAnnotationBody, UpdateAnnotationBody } from '../types';

export const annotationsRouter = Router();

annotationsRouter.post(
  '/',
  async (req: Request<{}, unknown, CreateAnnotationBody>, res: Response) => {
    const { content, readingId, authorId, parentId } = req.body;

    if (!content?.trim()) {
      res.status(400).json({ error: 'Annotation content cannot be empty' });
      return;
    }

    if (!readingId || !authorId) {
      res.status(400).json({ error: 'readingId and authorId are required' });
      return;
    }

    if (parentId) {
      const parent = await prisma.annotation.findUnique({ where: { id: parentId } });
      if (!parent) {
        res.status(404).json({ error: 'Parent annotation not found' });
        return;
      }
      if (parent.readingId !== readingId) {
        res.status(400).json({ error: 'Reply must be on the same reading as the parent' });
        return;
      }
    }

    const annotation = await prisma.annotation.create({
      data: {
        content: content.trim(),
        readingId,
        authorId,
        ...(parentId && { parentId }),
      },
      include: { author: true },
    });

    res.status(201).json(annotation);
  },
);

annotationsRouter.patch(
  '/:id',
  async (req: Request<{ id: string }, unknown, UpdateAnnotationBody>, res: Response) => {
    const { content, authorId } = req.body;

    if (!content?.trim()) {
      res.status(400).json({ error: 'Annotation content cannot be empty' });
      return;
    }

    const existing = await prisma.annotation.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Annotation not found' });
      return;
    }

    if (existing.authorId !== authorId) {
      res.status(403).json({ error: 'You can only edit your own annotations' });
      return;
    }

    const updated = await prisma.annotation.update({
      where: { id: req.params.id },
      data: { content: content.trim() },
      include: { author: true },
    });

    res.json(updated);
  },
);

annotationsRouter.delete(
  '/:id',
  async (
    req: Request<{ id: string }, { success: true } | ApiError, { authorId: string }>,
    res: Response<{ success: true } | ApiError>,
  ) => {
    const { authorId } = req.body;

    const existing = await prisma.annotation.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Annotation not found' });
      return;
    }

    if (existing.authorId !== authorId) {
      res.status(403).json({ error: 'You can only delete your own annotations' });
      return;
    }

    await prisma.annotation.delete({ where: { id: req.params.id } });

    res.json({ success: true });
  },
);
