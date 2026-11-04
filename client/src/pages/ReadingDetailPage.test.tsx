import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import ReadingDetailPage from './ReadingDetailPage';
import { renderWithProviders } from '../test-utils';
import * as apiModule from '../app/api';

vi.mock('../app/api', async () => {
  const actual = await vi.importActual('../app/api');
  return {
    ...actual,
    useGetReadingQuery: vi.fn(),
    useGetReadingStatsQuery: vi.fn(),
    useCreateAnnotationMutation: vi.fn(),
    useUpdateAnnotationMutation: vi.fn(),
    useDeleteAnnotationMutation: vi.fn(),
  };
});

const mockInstructor = {
  id: 'inst-1',
  name: 'Dr. Smith',
  role: 'instructor' as const,
  createdAt: '2024-01-01T00:00:00Z',
};

const mockStudent = {
  id: 'stu-1',
  name: 'Sarah',
  role: 'student' as const,
  createdAt: '2024-01-01T00:00:00Z',
};

const mockStudent2 = {
  id: 'stu-2',
  name: 'Michael',
  role: 'student' as const,
  createdAt: '2024-01-01T00:00:00Z',
};

const mockReading = {
  id: 'r1',
  title: 'Introduction to Machine Learning',
  description: 'An overview of ML concepts including supervised and unsupervised learning.',
  createdBy: 'inst-1',
  createdAt: '2024-01-15T00:00:00Z',
  creator: mockInstructor,
  annotations: [
    {
      id: 'a1',
      content: 'Great reading!',
      readingId: 'r1',
      authorId: 'stu-1',
      parentId: null,
      createdAt: '2024-01-16T10:00:00Z',
      author: mockStudent,
      replies: [],
    },
  ],
};

const mockReadingMultipleAuthors = {
  ...mockReading,
  annotations: [
    {
      id: 'a1',
      content: 'Great reading!',
      readingId: 'r1',
      authorId: 'stu-1',
      parentId: null,
      createdAt: '2024-01-16T10:00:00Z',
      author: mockStudent,
      replies: [],
    },
    {
      id: 'a2',
      content: 'Very informative.',
      readingId: 'r1',
      authorId: 'stu-2',
      parentId: null,
      createdAt: '2024-01-16T11:00:00Z',
      author: mockStudent2,
      replies: [],
    },
    {
      id: 'a3',
      content: 'I have a follow-up question.',
      readingId: 'r1',
      authorId: 'stu-1',
      parentId: null,
      createdAt: '2024-01-16T12:00:00Z',
      author: mockStudent,
      replies: [],
    },
  ],
};

const mockReadingWithReplies = {
  ...mockReading,
  annotations: [
    {
      id: 'a1',
      content: 'Great reading!',
      readingId: 'r1',
      authorId: 'stu-1',
      parentId: null,
      createdAt: '2024-01-16T10:00:00Z',
      author: mockStudent,
      replies: [
        {
          id: 'r1-reply',
          content: 'I agree, very insightful!',
          readingId: 'r1',
          authorId: 'stu-2',
          parentId: 'a1',
          createdAt: '2024-01-16T11:00:00Z',
          author: mockStudent2,
          replies: [],
        },
      ],
    },
  ],
};

const mockStats = {
  readingId: 'r1',
  annotationCount: 1,
  uniqueStudents: 1,
};

const mockCreateAnnotation = vi.fn();
const mockUpdateAnnotation = vi.fn();
const mockDeleteAnnotation = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(apiModule.useCreateAnnotationMutation).mockReturnValue([
    mockCreateAnnotation,
    { isLoading: false, reset: vi.fn() } as any,
  ]);
  vi.mocked(apiModule.useUpdateAnnotationMutation).mockReturnValue([
    mockUpdateAnnotation,
    { isLoading: false, reset: vi.fn() } as any,
  ]);
  vi.mocked(apiModule.useDeleteAnnotationMutation).mockReturnValue([
    mockDeleteAnnotation,
    { isLoading: false, reset: vi.fn() } as any,
  ]);
  vi.mocked(apiModule.useGetReadingStatsQuery).mockReturnValue({
    data: mockStats,
    isLoading: false,
    error: undefined,
  } as any);
});

function renderDetailPage(
  currentUser: typeof mockInstructor | typeof mockStudent | typeof mockStudent2,
) {
  return renderWithProviders(
    <Routes>
      <Route path="/readings/:id" element={<ReadingDetailPage />} />
    </Routes>,
    {
      route: '/readings/r1',
      preloadedState: { auth: { currentUser } },
    },
  );
}

describe('ReadingDetailPage', () => {
  it('shows loading state', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    } as any);

    renderDetailPage(mockStudent);
    expect(screen.getByText(/loading reading/i)).toBeInTheDocument();
  });

  it('shows not found state', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { status: 404, data: 'Not found' },
    } as any);

    renderDetailPage(mockStudent);
    expect(screen.getByText(/reading not found/i)).toBeInTheDocument();
  });

  it('renders reading details', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReading,
      isLoading: false,
      error: undefined,
    } as any);

    renderDetailPage(mockStudent);

    expect(screen.getByText('Introduction to Machine Learning')).toBeInTheDocument();
    expect(screen.getByText(/An overview of ML concepts/)).toBeInTheDocument();
  });

  it('renders annotations with author and content', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReading,
      isLoading: false,
      error: undefined,
    } as any);

    renderDetailPage(mockStudent);

    expect(screen.getByText('Great reading!')).toBeInTheDocument();
    expect(screen.getAllByText('Sarah').length).toBeGreaterThanOrEqual(1);
  });

  it('shows discussion count', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReading,
      isLoading: false,
      error: undefined,
    } as any);

    renderDetailPage(mockStudent);
    expect(screen.getByText('Discussion (1)')).toBeInTheDocument();
  });

  it('shows annotation form for students', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReading,
      isLoading: false,
      error: undefined,
    } as any);

    renderDetailPage(mockStudent);

    expect(screen.getByPlaceholderText(/share your thoughts/i)).toBeInTheDocument();
    expect(screen.getByText('Post')).toBeInTheDocument();
  });

  it('hides annotation form for instructors', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReading,
      isLoading: false,
      error: undefined,
    } as any);

    renderDetailPage(mockInstructor);

    expect(screen.queryByPlaceholderText(/share your thoughts/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Post')).not.toBeInTheDocument();
  });

  it('shows stats bar for instructors', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReading,
      isLoading: false,
      error: undefined,
    } as any);

    renderDetailPage(mockInstructor);

    expect(screen.getByText('Annotations')).toBeInTheDocument();
    expect(screen.getByText('Students Participating')).toBeInTheDocument();
  });

  it('hides stats bar for students', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReading,
      isLoading: false,
      error: undefined,
    } as any);

    renderDetailPage(mockStudent);

    expect(screen.queryByText('Students Participating')).not.toBeInTheDocument();
  });

  it('shows empty annotations state', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: { ...mockReading, annotations: [] },
      isLoading: false,
      error: undefined,
    } as any);

    renderDetailPage(mockStudent);

    expect(screen.getByText('No annotations yet.')).toBeInTheDocument();
    expect(screen.getByText('Be the first to share your thoughts!')).toBeInTheDocument();
  });

  it('validates empty annotation submission', async () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReading,
      isLoading: false,
      error: undefined,
    } as any);

    const user = userEvent.setup();
    renderDetailPage(mockStudent);

    await user.click(screen.getByText('Post'));

    expect(screen.getByText('Annotation cannot be empty.')).toBeInTheDocument();
    expect(mockCreateAnnotation).not.toHaveBeenCalled();
  });

  it('shows back link to readings list', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReading,
      isLoading: false,
      error: undefined,
    } as any);

    renderDetailPage(mockStudent);

    const backLink = screen.getByText(/back to readings/i);
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/readings');
  });

  it('shows filter dropdown with unique authors', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReadingMultipleAuthors,
      isLoading: false,
      error: undefined,
    } as any);

    renderDetailPage(mockStudent);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('All students');
    expect(options[1]).toHaveTextContent('Michael');
    expect(options[2]).toHaveTextContent('Sarah');
  });

  it('filters annotations by selected student', async () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReadingMultipleAuthors,
      isLoading: false,
      error: undefined,
    } as any);

    const user = userEvent.setup();
    renderDetailPage(mockStudent);

    expect(screen.getByText('Great reading!')).toBeInTheDocument();
    expect(screen.getByText('Very informative.')).toBeInTheDocument();
    expect(screen.getByText('I have a follow-up question.')).toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox'), 'stu-2');

    expect(screen.queryByText('Great reading!')).not.toBeInTheDocument();
    expect(screen.getByText('Very informative.')).toBeInTheDocument();
    expect(screen.queryByText('I have a follow-up question.')).not.toBeInTheDocument();
    expect(screen.getByText(/1 of 3/)).toBeInTheDocument();
  });

  it('resets filter to show all annotations', async () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReadingMultipleAuthors,
      isLoading: false,
      error: undefined,
    } as any);

    const user = userEvent.setup();
    renderDetailPage(mockStudent);

    await user.selectOptions(screen.getByRole('combobox'), 'stu-2');
    expect(screen.queryByText('Great reading!')).not.toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox'), '');
    expect(screen.getByText('Great reading!')).toBeInTheDocument();
    expect(screen.getByText('Very informative.')).toBeInTheDocument();
  });

  it('hides filter dropdown when no annotations', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: { ...mockReading, annotations: [] },
      isLoading: false,
      error: undefined,
    } as any);

    renderDetailPage(mockStudent);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('shows filtered empty state when filter matches no annotations', async () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReadingMultipleAuthors,
      isLoading: false,
      error: undefined,
    } as any);

    const user = userEvent.setup();
    renderDetailPage(mockStudent);

    await user.selectOptions(screen.getByRole('combobox'), 'stu-2');

    await user.selectOptions(screen.getByRole('combobox'), 'stu-1');
    expect(screen.getByText('Great reading!')).toBeInTheDocument();
    expect(screen.queryByText('No annotations from this student.')).not.toBeInTheDocument();
  });

  it('shows edit and delete buttons only on own annotations', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReadingMultipleAuthors,
      isLoading: false,
      error: undefined,
    } as any);

    renderDetailPage(mockStudent);

    const editButtons = screen.getAllByText('Edit');
    const deleteButtons = screen.getAllByText('Delete');
    // mockStudent (stu-1) has 2 annotations in mockReadingMultipleAuthors
    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it('hides edit and delete buttons for other students annotations', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReading,
      isLoading: false,
      error: undefined,
    } as any);

    renderDetailPage(mockStudent2);

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('enters edit mode and saves', async () => {
    mockUpdateAnnotation.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReading,
      isLoading: false,
      error: undefined,
    } as any);

    const user = userEvent.setup();
    renderDetailPage(mockStudent);

    await user.click(screen.getByText('Edit'));

    expect(screen.getByDisplayValue('Great reading!')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    const editTextarea = screen.getByDisplayValue('Great reading!');
    await user.clear(editTextarea);
    await user.type(editTextarea, 'Updated comment');
    await user.click(screen.getByText('Save'));

    expect(mockUpdateAnnotation).toHaveBeenCalledWith({
      id: 'a1',
      content: 'Updated comment',
      authorId: 'stu-1',
      readingId: 'r1',
    });
  });

  it('cancels edit mode without saving', async () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReading,
      isLoading: false,
      error: undefined,
    } as any);

    const user = userEvent.setup();
    renderDetailPage(mockStudent);

    await user.click(screen.getByText('Edit'));
    const editTextarea = screen.getByDisplayValue('Great reading!');
    await user.clear(editTextarea);
    await user.type(editTextarea, 'Changed text');
    await user.click(screen.getByText('Cancel'));

    expect(screen.getByText('Great reading!')).toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    expect(mockUpdateAnnotation).not.toHaveBeenCalled();
  });

  it('shows delete confirmation and deletes', async () => {
    mockDeleteAnnotation.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReading,
      isLoading: false,
      error: undefined,
    } as any);

    const user = userEvent.setup();
    renderDetailPage(mockStudent);

    await user.click(screen.getByText('Delete'));

    expect(screen.getByText('Delete?')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();

    await user.click(screen.getByText('Yes'));

    expect(mockDeleteAnnotation).toHaveBeenCalledWith({
      id: 'a1',
      authorId: 'stu-1',
      readingId: 'r1',
    });
  });

  it('cancels delete confirmation', async () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReading,
      isLoading: false,
      error: undefined,
    } as any);

    const user = userEvent.setup();
    renderDetailPage(mockStudent);

    await user.click(screen.getByText('Delete'));
    expect(screen.getByText('Delete?')).toBeInTheDocument();

    await user.click(screen.getByText('No'));
    expect(screen.queryByText('Delete?')).not.toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(mockDeleteAnnotation).not.toHaveBeenCalled();
  });

  it('hides edit/delete for instructors viewing annotations', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReading,
      isLoading: false,
      error: undefined,
    } as any);

    renderDetailPage(mockInstructor);

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('shows reply button for students on all annotations', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReadingMultipleAuthors,
      isLoading: false,
      error: undefined,
    } as any);

    renderDetailPage(mockStudent);

    const replyButtons = screen.getAllByText('Reply');
    expect(replyButtons).toHaveLength(3);
  });

  it('hides reply button for instructors', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReading,
      isLoading: false,
      error: undefined,
    } as any);

    renderDetailPage(mockInstructor);

    expect(screen.queryByText('Reply')).not.toBeInTheDocument();
  });

  it('opens reply form and submits reply', async () => {
    mockCreateAnnotation.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReading,
      isLoading: false,
      error: undefined,
    } as any);

    const user = userEvent.setup();
    renderDetailPage(mockStudent);

    await user.click(screen.getByText('Reply'));

    const replyInput = screen.getByPlaceholderText(/reply to sarah/i);
    expect(replyInput).toBeInTheDocument();

    await user.type(replyInput, 'Thanks for sharing!');
    await user.click(
      screen.getAllByText('Reply').find((el) => el.tagName === 'BUTTON' && el.closest('form'))!,
    );

    expect(mockCreateAnnotation).toHaveBeenCalledWith({
      content: 'Thanks for sharing!',
      readingId: 'r1',
      authorId: 'stu-1',
      parentId: 'a1',
    });
  });

  it('cancels reply form', async () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReading,
      isLoading: false,
      error: undefined,
    } as any);

    const user = userEvent.setup();
    renderDetailPage(mockStudent);

    await user.click(screen.getByText('Reply'));
    expect(screen.getByPlaceholderText(/reply to sarah/i)).toBeInTheDocument();

    await user.click(screen.getByText('Cancel'));
    expect(screen.queryByPlaceholderText(/reply to sarah/i)).not.toBeInTheDocument();
  });

  it('renders nested replies', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReadingWithReplies,
      isLoading: false,
      error: undefined,
    } as any);

    renderDetailPage(mockStudent);

    expect(screen.getByText('Great reading!')).toBeInTheDocument();
    expect(screen.getByText('I agree, very insightful!')).toBeInTheDocument();
    expect(screen.getAllByText('Michael').length).toBeGreaterThanOrEqual(1);
  });

  it('shows edit/delete on own replies', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReadingWithReplies,
      isLoading: false,
      error: undefined,
    } as any);

    renderDetailPage(mockStudent2);

    const editButtons = screen.getAllByText('Edit');
    const deleteButtons = screen.getAllByText('Delete');
    expect(editButtons).toHaveLength(1);
    expect(deleteButtons).toHaveLength(1);
  });

  it('allows student to reply to own annotation', async () => {
    mockCreateAnnotation.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReading,
      isLoading: false,
      error: undefined,
    } as any);

    const user = userEvent.setup();
    renderDetailPage(mockStudent);

    await user.click(screen.getByText('Reply'));
    const replyInput = screen.getByPlaceholderText(/reply to sarah/i);
    await user.type(replyInput, 'Adding more context');

    const submitButton = screen
      .getAllByText('Reply')
      .find((el) => el.tagName === 'BUTTON' && el.closest('form'))!;
    await user.click(submitButton);

    expect(mockCreateAnnotation).toHaveBeenCalledWith({
      content: 'Adding more context',
      readingId: 'r1',
      authorId: 'stu-1',
      parentId: 'a1',
    });
  });

  it('includes reply authors in filter dropdown', () => {
    vi.mocked(apiModule.useGetReadingQuery).mockReturnValue({
      data: mockReadingWithReplies,
      isLoading: false,
      error: undefined,
    } as any);

    renderDetailPage(mockStudent);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('All students');
    expect(options[1]).toHaveTextContent('Michael');
    expect(options[2]).toHaveTextContent('Sarah');
  });
});
