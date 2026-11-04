import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useGetUsersQuery } from '../app/api';
import type { User } from '../app/types';
import { useAppDispatch } from '../app/hooks';
import { setCurrentUser } from '../features/auth/authSlice';
import { useTranslation } from '../i18n';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const StyledTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSize.xxxl};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StyledSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  font-size: ${({ theme }) => theme.fontSize.lg};
`;

const StyledSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  width: 100%;
  max-width: 480px;
`;

const StyledSectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.sm};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StyledUserGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StyledUserCard = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadow.md};
  }
`;

const StyledUserName = styled.span`
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledArrow = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSize.lg};
`;

export default function LoginPage() {
  const { data: users, isLoading, error } = useGetUsersQuery();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSelectUser = (user: User) => {
    dispatch(setCurrentUser(user));
    navigate('/readings');
  };

  if (isLoading) return <StyledContainer>{t('login.loading')}</StyledContainer>;
  if (error) return <StyledContainer>{t('login.error')}</StyledContainer>;

  const instructors = users?.filter((u) => u.role === 'instructor') ?? [];
  const students = users?.filter((u) => u.role === 'student') ?? [];

  return (
    <StyledContainer>
      <StyledTitle>{t('login.title')}</StyledTitle>
      <StyledSubtitle>{t('login.subtitle')}</StyledSubtitle>

      <StyledSection>
        <StyledSectionTitle>{t('login.instructors')}</StyledSectionTitle>
        <StyledUserGrid>
          {instructors.map((user) => (
            <StyledUserCard key={user.id} onClick={() => handleSelectUser(user)}>
              <StyledUserName>{user.name}</StyledUserName>
              <StyledArrow>&rarr;</StyledArrow>
            </StyledUserCard>
          ))}
        </StyledUserGrid>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t('login.students')}</StyledSectionTitle>
        <StyledUserGrid>
          {students.map((user) => (
            <StyledUserCard key={user.id} onClick={() => handleSelectUser(user)}>
              <StyledUserName>{user.name}</StyledUserName>
              <StyledArrow>&rarr;</StyledArrow>
            </StyledUserCard>
          ))}
        </StyledUserGrid>
      </StyledSection>
    </StyledContainer>
  );
}
