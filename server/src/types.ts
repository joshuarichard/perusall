// --- Request Bodies (server-only) ---

export type CreateReadingBody = {
  title: string;
  description: string;
  createdBy: string;
};

export type CreateAnnotationBody = {
  content: string;
  readingId: string;
  authorId: string;
  parentId?: string;
};

export type UpdateAnnotationBody = {
  content: string;
  authorId: string;
};

export type ApiError = {
  error: string;
};
