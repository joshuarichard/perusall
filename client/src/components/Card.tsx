import styled from 'styled-components';

export const StyledCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

export const StyledClickableCard = styled(StyledCard)`
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadow.md};
  }
`;
