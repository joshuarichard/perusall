import styled from 'styled-components';

export const StyledButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const StyledCancelButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSize.sm};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

export const StyledActionButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const StyledDeleteButton = styled(StyledActionButton)`
  &:hover {
    color: ${({ theme }) => theme.colors.error};
  }
`;
