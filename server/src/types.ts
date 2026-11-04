// --- Request Bodies (server-only) ---

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

export interface ApiError {
  error: string;
}
