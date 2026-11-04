import styled from 'styled-components';

export const StyledPageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

export const StyledPageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSize.xxl};
`;

export const StyledSuccessMessage = styled.div`
  background: ${({ theme }) => theme.colors.successLight};
  color: ${({ theme }) => theme.colors.success};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;
