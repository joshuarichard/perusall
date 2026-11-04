export interface CreateReadingBody {
  title: string;
  description: string;
  createdBy: string;
}

export interface DeleteReadingBody {
  userId: string;
}

export interface UpdateAnnotationBody {
  content: string;
  authorId: string;
}

export interface CreateAnnotationBody extends UpdateAnnotationBody {
  readingId: string;
  parentId?: string;
}

export interface ApiError {
  error: string;
}

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
  DELETE_OWN_READING_ONLY: 'You can only delete your own readings',
} as const;
