// Shared types used by both client and server.
// createdAt is string because JSON serialization converts Date to ISO string.

export type User = {
  id: string;
  name: string;
  role: 'instructor' | 'student';
  createdAt: string;
};

export type Reading = {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  creator: User;
  _count: { annotations: number };
};

export type ReadingDetail = {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  creator: User;
  annotations: Annotation[];
};

export type Annotation = {
  id: string;
  content: string;
  readingId: string;
  authorId: string;
  parentId: string | null;
  createdAt: string;
  author: User;
  replies?: Annotation[];
};

export type ReadingStats = {
  readingId: string;
  annotationCount: number;
  uniqueStudents: number;
};

export type DashboardData = {
  summary: {
    totalReadings: number;
    totalAnnotations: number;
    uniqueStudents: number;
  };
  readings: {
    id: string;
    title: string;
    annotationCount: number;
    uniqueStudents: number;
    lastActivity: string | null;
    createdAt: string;
  }[];
  students: {
    id: string;
    name: string;
    annotationCount: number;
    readingsParticipated: number;
  }[];
};
