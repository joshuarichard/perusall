import { describe, it, expect } from 'vitest';
import authReducer, { setCurrentUser, logout } from './authSlice';
import type { User } from './api';

const mockUser: User = {
  id: 'user-1',
  name: 'Dr. Smith',
  role: 'instructor',
  createdAt: '2024-01-01T00:00:00Z',
};

describe('authSlice', () => {
  it('has null initial state', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state.currentUser).toBeNull();
  });

  it('sets current user', () => {
    const state = authReducer(undefined, setCurrentUser(mockUser));
    expect(state.currentUser).toEqual(mockUser);
  });

  it('clears user on logout', () => {
    const loggedIn = authReducer(undefined, setCurrentUser(mockUser));
    const state = authReducer(loggedIn, logout());
    expect(state.currentUser).toBeNull();
  });

  it('replaces current user when switching', () => {
    const student: User = {
      id: 'stu-1',
      name: 'Sarah',
      role: 'student',
      createdAt: '2024-01-01T00:00:00Z',
    };
    const first = authReducer(undefined, setCurrentUser(mockUser));
    const second = authReducer(first, setCurrentUser(student));
    expect(second.currentUser).toEqual(student);
  });
});
