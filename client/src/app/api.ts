import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { User, Reading, ReadingDetail, Annotation, ReadingStats } from './types';

export type { User, Reading, ReadingDetail, Annotation, ReadingStats } from './types';

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

    deleteReading: builder.mutation<{ success: true }, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `/readings/${id}`,
        method: 'DELETE',
        body: { userId },
      }),
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
  useDeleteReadingMutation,
  useCreateAnnotationMutation,
  useUpdateAnnotationMutation,
  useDeleteAnnotationMutation,
} = api;
