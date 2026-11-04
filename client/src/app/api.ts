import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// RTK Query replaces hand-written fetch calls, loading states, and cache logic.
// Each endpoint generates a React hook (e.g., useGetReadingsQuery).
// Tags enable automatic cache invalidation: creating an annotation
// invalidates the reading detail cache so it refetches fresh data.

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

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Reading', 'ReadingDetail'],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
    }),

    getReadings: builder.query<Reading[], void>({
      query: () => '/readings',
      providesTags: ['Reading'],
    }),

    getReading: builder.query<ReadingDetail, string>({
      query: (id) => `/readings/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'ReadingDetail', id }],
    }),

    getReadingStats: builder.query<ReadingStats, string>({
      query: (id) => `/readings/${id}/stats`,
    }),

    createReading: builder.mutation<
      Reading,
      { title: string; description: string; createdBy: string }
    >({
      query: (body) => ({ url: '/readings', method: 'POST', body }),
      // After creating a reading, invalidate the list so it shows up immediately
      invalidatesTags: ['Reading'],
    }),

    createAnnotation: builder.mutation<
      Annotation,
      { content: string; readingId: string; authorId: string; parentId?: string }
    >({
      query: (body) => ({ url: '/annotations', method: 'POST', body }),
      invalidatesTags: (_result, _error, { readingId }) => [
        'Reading',
        { type: 'ReadingDetail', id: readingId },
      ],
    }),

    updateAnnotation: builder.mutation<
      Annotation,
      { id: string; content: string; authorId: string; readingId: string }
    >({
      query: ({ id, content, authorId }) => ({
        url: `/annotations/${id}`,
        method: 'PATCH',
        body: { content, authorId },
      }),
      invalidatesTags: (_result, _error, { readingId }) => [
        { type: 'ReadingDetail', id: readingId },
      ],
    }),

    deleteAnnotation: builder.mutation<
      { success: true },
      { id: string; authorId: string; readingId: string }
    >({
      query: ({ id, authorId }) => ({
        url: `/annotations/${id}`,
        method: 'DELETE',
        body: { authorId },
      }),
      invalidatesTags: (_result, _error, { readingId }) => [
        'Reading',
        { type: 'ReadingDetail', id: readingId },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetReadingsQuery,
  useGetReadingQuery,
  useGetReadingStatsQuery,
  useCreateReadingMutation,
  useCreateAnnotationMutation,
  useUpdateAnnotationMutation,
  useDeleteAnnotationMutation,
} = api;
