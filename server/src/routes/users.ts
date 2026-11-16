import { type Request, type Response, Router } from 'express';

import { prisma } from '../data';

export const usersRouter = Router();

usersRouter.get('/', async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(users);
});
