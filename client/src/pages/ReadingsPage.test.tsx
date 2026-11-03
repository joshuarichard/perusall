import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReadingsPage from './ReadingsPage';
import { renderWithProviders } from '../test-utils';
import * as apiModule from '../app/api';

vi.mock('../app/api', async () => {
  const actual = await vi.importActual('../app/api');
  return {
    ...actual,
    useGetReadingsQuery: vi.fn(),
    useCreateReadingMutation: vi.fn(),
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

const mockReadings = [
  {
    id: 'r1',
    title: 'Introduction to Machine Learning',
    description: 'An overview of ML concepts',
    createdBy: 'inst-1',
    createdAt: '2024-01-15T00:00:00Z',
    creator: mockInstructor,
    _count: { annotations: 3 },
  },
  {
    id: 'r2',
    title: 'Shakespeare Analysis',
    description: 'A close reading of Hamlet',
    createdBy: 'inst-1',
    createdAt: '2024-01-10T00:00:00Z',
    creator: mockInstructor,
    _count: { annotations: 0 },
  },
];

const mockCreateReading = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(apiModule.useCreateReadingMutation).mockReturnValue([
    mockCreateReading,
    { isLoading: false, reset: vi.fn() } as any,
  ]);
});

describe('ReadingsPage', () => {
  it('shows loading state', () => {
    vi.mocked(apiModule.useGetReadingsQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    } as any);

    renderWithProviders(<ReadingsPage />, {
      preloadedState: { auth: { currentUser: mockStudent } },
    });
    expect(screen.getByText(/loading readings/i)).toBeInTheDocument();
  });

  it('shows error state', () => {
    vi.mocked(apiModule.useGetReadingsQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { status: 500, data: 'Error' },
    } as any);

    renderWithProviders(<ReadingsPage />, {
      preloadedState: { auth: { currentUser: mockStudent } },
    });
    expect(screen.getByText(/failed to load readings/i)).toBeInTheDocument();
  });

  it('renders readings list', () => {
    vi.mocked(apiModule.useGetReadingsQuery).mockReturnValue({
      data: mockReadings,
      isLoading: false,
      error: undefined,
    } as any);

    renderWithProviders(<ReadingsPage />, {
      preloadedState: { auth: { currentUser: mockStudent } },
    });

    expect(screen.getByText('Introduction to Machine Learning')).toBeInTheDocument();
    expect(screen.getByText('Shakespeare Analysis')).toBeInTheDocument();
  });

  it('displays annotation count per reading', () => {
    vi.mocked(apiModule.useGetReadingsQuery).mockReturnValue({
      data: mockReadings,
      isLoading: false,
      error: undefined,
    } as any);

    renderWithProviders(<ReadingsPage />, {
      preloadedState: { auth: { currentUser: mockStudent } },
    });

    expect(screen.getByText('3 annotations')).toBeInTheDocument();
    expect(screen.getByText('0 annotations')).toBeInTheDocument();
  });

  it('shows "New Reading" button for instructors', () => {
    vi.mocked(apiModule.useGetReadingsQuery).mockReturnValue({
      data: mockReadings,
      isLoading: false,
      error: undefined,
    } as any);

    renderWithProviders(<ReadingsPage />, {
      preloadedState: { auth: { currentUser: mockInstructor } },
    });

    expect(screen.getByText('+ New Reading')).toBeInTheDocument();
  });

  it('hides "New Reading" button for students', () => {
    vi.mocked(apiModule.useGetReadingsQuery).mockReturnValue({
      data: mockReadings,
      isLoading: false,
      error: undefined,
    } as any);

    renderWithProviders(<ReadingsPage />, {
      preloadedState: { auth: { currentUser: mockStudent } },
    });

    expect(screen.queryByText('+ New Reading')).not.toBeInTheDocument();
  });

  it('shows empty state when no readings', () => {
    vi.mocked(apiModule.useGetReadingsQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    } as any);

    renderWithProviders(<ReadingsPage />, {
      preloadedState: { auth: { currentUser: mockStudent } },
    });

    expect(screen.getByText('No readings yet.')).toBeInTheDocument();
  });

  it('shows instructor-specific empty state message', () => {
    vi.mocked(apiModule.useGetReadingsQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    } as any);

    renderWithProviders(<ReadingsPage />, {
      preloadedState: { auth: { currentUser: mockInstructor } },
    });

    expect(screen.getByText('Create your first reading to get started.')).toBeInTheDocument();
  });

  it('opens create form on button click', async () => {
    vi.mocked(apiModule.useGetReadingsQuery).mockReturnValue({
      data: mockReadings,
      isLoading: false,
      error: undefined,
    } as any);

    const user = userEvent.setup();
    renderWithProviders(<ReadingsPage />, {
      preloadedState: { auth: { currentUser: mockInstructor } },
    });

    await user.click(screen.getByText('+ New Reading'));

    expect(screen.getByText('Create New Reading')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Reading title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Reading description')).toBeInTheDocument();
  });

  it('validates empty form submission', async () => {
    vi.mocked(apiModule.useGetReadingsQuery).mockReturnValue({
      data: mockReadings,
      isLoading: false,
      error: undefined,
    } as any);

    const user = userEvent.setup();
    renderWithProviders(<ReadingsPage />, {
      preloadedState: { auth: { currentUser: mockInstructor } },
    });

    await user.click(screen.getByText('+ New Reading'));
    await user.click(screen.getByText('Create Reading'));

    expect(screen.getByText('Both title and description are required.')).toBeInTheDocument();
    expect(mockCreateReading).not.toHaveBeenCalled();
  });

  it('hides form on cancel', async () => {
    vi.mocked(apiModule.useGetReadingsQuery).mockReturnValue({
      data: mockReadings,
      isLoading: false,
      error: undefined,
    } as any);

    const user = userEvent.setup();
    renderWithProviders(<ReadingsPage />, {
      preloadedState: { auth: { currentUser: mockInstructor } },
    });

    await user.click(screen.getByText('+ New Reading'));
    expect(screen.getByText('Create New Reading')).toBeInTheDocument();

    await user.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Create New Reading')).not.toBeInTheDocument();
  });
});
