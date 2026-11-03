import { Router, type Request, type Response } from 'express';
import { prisma } from '../data';
import type { Annotation, ApiError, CreateAnnotationBody } from '../types';

export const annotationsRouter = Router();

annotationsRouter.post(
  '/',
  async (
    req: Request<{}, Annotation | ApiError, CreateAnnotationBody>,
    res: Response<Annotation | ApiError>,
  ) => {
    const { content, readingId, authorId } = req.body;

    if (!content?.trim()) {
      res.status(400).json({ error: 'Annotation content cannot be empty' });
      return;
    }

    if (!readingId || !authorId) {
      res.status(400).json({ error: 'readingId and authorId are required' });
      return;
    }

    const annotation = await prisma.annotation.create({
      data: {
        content: content.trim(),
        readingId,
        authorId,
      },
      include: { author: true },
    });

    res.status(201).json(annotation);
  },
);
