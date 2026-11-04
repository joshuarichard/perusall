import { z } from 'zod';

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

export const CreateReadingSchema = z.object({
  title: z
    .string({ error: Errors.TITLE_AND_DESCRIPTION_REQUIRED })
    .trim()
    .min(1, Errors.TITLE_AND_DESCRIPTION_REQUIRED),
  description: z
    .string({ error: Errors.TITLE_AND_DESCRIPTION_REQUIRED })
    .trim()
    .min(1, Errors.TITLE_AND_DESCRIPTION_REQUIRED),
  createdBy: z.string().min(1),
});

export const DeleteReadingSchema = z.object({
  userId: z.string().min(1),
});

export const UpdateAnnotationSchema = z.object({
  content: z.string({ error: Errors.ANNOTATION_EMPTY }).trim().min(1, Errors.ANNOTATION_EMPTY),
  authorId: z.string({ error: Errors.READING_AND_AUTHOR_REQUIRED }).min(1),
});

export const CreateAnnotationSchema = UpdateAnnotationSchema.extend({
  readingId: z.string({ error: Errors.READING_AND_AUTHOR_REQUIRED }).min(1),
  parentId: z.string().optional(),
});

export const DeleteAnnotationSchema = z.object({
  authorId: z.string().min(1),
});

export type CreateReadingBody = z.infer<typeof CreateReadingSchema>;
export type DeleteReadingBody = z.infer<typeof DeleteReadingSchema>;
export type UpdateAnnotationBody = z.infer<typeof UpdateAnnotationSchema>;
export type CreateAnnotationBody = z.infer<typeof CreateAnnotationSchema>;
export type DeleteAnnotationBody = z.infer<typeof DeleteAnnotationSchema>;
