import { Router, type Request, type Response } from 'express';
import { prisma } from '../data';
import type { DashboardData } from '../../../shared/types';

export const dashboardRouter = Router();

dashboardRouter.get('/', async (_req: Request, res: Response) => {
  const readings = await prisma.reading.findMany({
    include: {
      annotations: {
        select: { authorId: true, createdAt: true },
      },
      _count: { select: { annotations: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const allStudentIds = new Set<string>();
  const studentMap = new Map<
    string,
    { name: string; annotations: number; readings: Set<string> }
  >();

  const readingSummaries = readings.map((r) => {
    const uniqueStudentIds = new Set(r.annotations.map((a) => a.authorId));
    const lastActivity =
      r.annotations.length > 0
        ? r.annotations
            .reduce((latest, a) =>
              new Date(a.createdAt) > new Date(latest.createdAt) ? a : latest,
            )
            .createdAt.toISOString()
        : null;

    for (const a of r.annotations) {
      allStudentIds.add(a.authorId);
      const existing = studentMap.get(a.authorId);
      if (existing) {
        existing.annotations++;
        existing.readings.add(r.id);
      } else {
        studentMap.set(a.authorId, { name: '', annotations: 1, readings: new Set([r.id]) });
      }
    }

    return {
      id: r.id,
      title: r.title,
      annotationCount: r._count.annotations,
      uniqueStudents: uniqueStudentIds.size,
      lastActivity,
      createdAt: r.createdAt.toISOString(),
    };
  });

  // Fetch student names
  if (studentMap.size > 0) {
    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(studentMap.keys()) } },
      select: { id: true, name: true },
    });
    for (const u of users) {
      const entry = studentMap.get(u.id);
      if (entry) entry.name = u.name;
    }
  }

  const totalAnnotations = readings.reduce((sum, r) => sum + r._count.annotations, 0);

  const data: DashboardData = {
    summary: {
      totalReadings: readings.length,
      totalAnnotations,
      uniqueStudents: allStudentIds.size,
    },
    readings: readingSummaries,
    students: Array.from(studentMap, ([id, s]) => ({
      id,
      name: s.name,
      annotationCount: s.annotations,
      readingsParticipated: s.readings.size,
    })).sort((a, b) => b.annotationCount - a.annotationCount),
  };

  res.json(data);
});
