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

export const Errors = {
  READING_NOT_FOUND: 'Reading not found',
  TITLE_AND_DESCRIPTION_REQUIRED: 'Title and description are required',
  ANNOTATION_EMPTY: 'Annotation content cannot be empty',
  READING_AND_AUTHOR_REQUIRED: 'readingId and authorId are required',
  PARENT_NOT_FOUND: 'Parent annotation not found',
  REPLY_WRONG_READING: 'Reply must be on the same reading as the parent',
  ANNOTATION_NOT_FOUND: 'Annotation not found',
  EDIT_OWN_ONLY: 'You can only edit your own annotations',
  DELETE_OWN_ONLY: 'You can only delete your own annotations',
} as const;
