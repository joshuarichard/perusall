import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';
import { renderWithProviders } from '../test-utils';
import * as apiModule from '../app/api';

vi.mock('../app/api', async () => {
  const actual = await vi.importActual('../app/api');
  return {
    ...actual,
    useGetUsersQuery: vi.fn(),
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

beforeEach(() => {
  vi.resetAllMocks();
});

describe('LoginPage', () => {
  it('shows loading state', () => {
    vi.mocked(apiModule.useGetUsersQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    } as any);

    renderWithProviders(<LoginPage />);
    expect(screen.getByText(/loading users/i)).toBeInTheDocument();
  });

  it('shows error when API fails', () => {
    vi.mocked(apiModule.useGetUsersQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { status: 500, data: 'Error' },
    } as any);

    renderWithProviders(<LoginPage />);
    expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
  });

  it('renders users grouped by role', () => {
    vi.mocked(apiModule.useGetUsersQuery).mockReturnValue({
      data: [mockInstructor, mockStudent],
      isLoading: false,
      error: undefined,
    } as any);

    renderWithProviders(<LoginPage />);

    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('Sarah')).toBeInTheDocument();
    expect(screen.getByText('Instructors')).toBeInTheDocument();
    expect(screen.getByText('Students')).toBeInTheDocument();
  });

  it('sets current user on click', async () => {
    vi.mocked(apiModule.useGetUsersQuery).mockReturnValue({
      data: [mockInstructor, mockStudent],
      isLoading: false,
      error: undefined,
    } as any);

    const user = userEvent.setup();
    const { store } = renderWithProviders(<LoginPage />);

    await user.click(screen.getByText('Sarah'));

    expect(store.getState().auth.currentUser).toEqual(mockStudent);
  });

  it('renders app title', () => {
    vi.mocked(apiModule.useGetUsersQuery).mockReturnValue({
      data: [mockInstructor],
      isLoading: false,
      error: undefined,
    } as any);

    renderWithProviders(<LoginPage />);
    expect(screen.getByAltText('Perusall')).toBeInTheDocument();
  });
});
