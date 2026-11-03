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
      createdAt: '2024-01-16T10:00:00Z',
      author: mockStudent,
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
      createdAt: '2024-01-16T10:00:00Z',
      author: mockStudent,
    },
    {
      id: 'a2',
      content: 'Very informative.',
      readingId: 'r1',
      authorId: 'stu-2',
      createdAt: '2024-01-16T11:00:00Z',
      author: mockStudent2,
    },
    {
      id: 'a3',
      content: 'I have a follow-up question.',
      readingId: 'r1',
      authorId: 'stu-1',
      createdAt: '2024-01-16T12:00:00Z',
      author: mockStudent,
    },
  ],
};

const mockStats = {
  readingId: 'r1',
  annotationCount: 1,
  uniqueStudents: 1,
};

const mockCreateAnnotation = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(apiModule.useCreateAnnotationMutation).mockReturnValue([
    mockCreateAnnotation,
    { isLoading: false, reset: vi.fn() } as any,
  ]);
  vi.mocked(apiModule.useGetReadingStatsQuery).mockReturnValue({
    data: mockStats,
    isLoading: false,
    error: undefined,
  } as any);
});

function renderDetailPage(currentUser: typeof mockInstructor | typeof mockStudent) {
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
});
