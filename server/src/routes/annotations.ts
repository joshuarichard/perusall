import { Router, type Request, type Response } from 'express';
import { prisma } from '../data';
import { Errors } from '../types';
import type { ApiError, CreateAnnotationBody, UpdateAnnotationBody } from '../types';

export const annotationsRouter = Router();

annotationsRouter.post(
  '/',
  async (req: Request<{}, unknown, CreateAnnotationBody>, res: Response) => {
    const { content, readingId, authorId, parentId } = req.body;

    if (!content?.trim()) {
      res.status(400).json({ error: Errors.ANNOTATION_EMPTY });
      return;
    }

    if (!readingId || !authorId) {
      res.status(400).json({ error: Errors.READING_AND_AUTHOR_REQUIRED });
      return;
    }

    if (parentId) {
      const parent = await prisma.annotation.findUnique({ where: { id: parentId } });
      if (!parent) {
        res.status(404).json({ error: Errors.PARENT_NOT_FOUND });
        return;
      }
      if (parent.readingId !== readingId) {
        res.status(400).json({ error: Errors.REPLY_WRONG_READING });
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
      res.status(400).json({ error: Errors.ANNOTATION_EMPTY });
      return;
    }

    const existing = await prisma.annotation.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      res.status(404).json({ error: Errors.ANNOTATION_NOT_FOUND });
      return;
    }

    if (existing.authorId !== authorId) {
      res.status(403).json({ error: Errors.EDIT_OWN_ONLY });
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
      res.status(404).json({ error: Errors.ANNOTATION_NOT_FOUND });
      return;
    }

    if (existing.authorId !== authorId) {
      res.status(403).json({ error: Errors.DELETE_OWN_ONLY });
      return;
    }

    await prisma.annotation.delete({ where: { id: req.params.id } });

    res.json({ success: true });
  },
);
