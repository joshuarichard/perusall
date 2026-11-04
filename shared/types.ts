// Shared types used by both client and server.
// createdAt is string because JSON serialization converts Date to ISO string.

export interface User {
  id: string;
  name: string;
  role: 'instructor' | 'student';
  createdAt: string;
}

export interface Reading {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  creator: User;
  _count: { annotations: number };
}

export interface ReadingDetail {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  creator: User;
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
