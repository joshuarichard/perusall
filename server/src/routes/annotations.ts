import { Router, type Request, type Response } from 'express';
import { prisma } from '../data';
import {
  Errors,
  CreateAnnotationSchema,
  UpdateAnnotationSchema,
  DeleteAnnotationSchema,
} from '../types';
import type {
  ApiError,
  CreateAnnotationBody,
  UpdateAnnotationBody,
  DeleteAnnotationBody,
} from '../types';
import { validate } from '../middleware/validate';

export const annotationsRouter = Router();

annotationsRouter.post(
  '/',
  validate(CreateAnnotationSchema),
  async (req: Request<{}, unknown, CreateAnnotationBody>, res: Response) => {
    const { content, readingId, authorId, parentId } = req.body;

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
        content,
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
  validate(UpdateAnnotationSchema),
  async (req: Request<{ id: string }, unknown, UpdateAnnotationBody>, res: Response) => {
    const { content, authorId } = req.body;

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
      data: { content },
      include: { author: true },
    });

    res.json(updated);
  },
);

annotationsRouter.delete(
  '/:id',
  validate(DeleteAnnotationSchema),
  async (
    req: Request<{ id: string }, { success: true } | ApiError, DeleteAnnotationBody>,
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
