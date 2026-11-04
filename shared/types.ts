// Shared types used by both client and server.
// createdAt is string because JSON serialization converts Date to ISO string.

export interface User {
  id: string;
  name: string;
  role: 'instructor' | 'student';
  createdAt: string;
}

interface ReadingBase {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  creator: User;
}

export interface Reading extends ReadingBase {
  _count: { annotations: number };
}

export interface ReadingDetail extends ReadingBase {
  annotations: Annotation[];
}

export interface Annotation {
  id: string;
  content: string;
  readingId: string;
  authorId: string;
  parentId: string | null;
  createdAt: string;
  author: User;
  replies?: Annotation[];
}

export interface ReadingStats {
  readingId: string;
  annotationCount: number;
  uniqueStudents: number;
}

export interface DashboardData {
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
}
