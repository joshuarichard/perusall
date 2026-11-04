// --- Shared Entities ---

export interface User {
  id: string;
  name: string;
  role: string;
  createdAt: Date;
}

export interface Annotation {
  id: string;
  content: string;
  readingId: string;
  authorId: string;
  parentId: string | null;
  createdAt: Date;
  author: User;
  replies?: Annotation[];
}

// --- Request Bodies ---

export interface CreateReadingBody {
  title: string;
  description: string;
  createdBy: string;
}

export interface CreateAnnotationBody {
  content: string;
  readingId: string;
  authorId: string;
  parentId?: string;
}

export interface UpdateAnnotationBody {
  content: string;
  authorId: string;
}

// --- Response Bodies ---

export interface ReadingListItem {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  creator: User;
  _count: { annotations: number };
}

export interface ReadingDetail {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  creator: User;
  annotations: Annotation[];
}

export interface ReadingStatsResponse {
  readingId: string;
  annotationCount: number;
  uniqueStudents: number;
}

export interface ApiError {
  error: string;
}
