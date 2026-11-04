import styled from 'styled-components';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { useThemeMode } from '../styles';
import { useTranslation } from '../i18n';

const StyledHeader = styled.header`
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledLogo = styled(Link)`
  font-size: ${({ theme }) => theme.fontSize.xl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
`;

const StyledUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StyledRoleBadge = styled.span<{ $role: string }>`
  background: ${({ $role, theme }) =>
    $role === 'instructor' ? theme.colors.primaryLight : theme.colors.successLight};
  color: ${({ $role, theme }) =>
    $role === 'instructor' ? theme.colors.primary : theme.colors.success};
  padding: 2px ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 600;
  text-transform: capitalize;
`;

const StyledLogoutButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSize.sm};

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const StyledThemeToggle = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSize.base};
  line-height: 1;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const StyledMain = styled.main`
  max-width: 960px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

export function Layout({ children }: { children: React.ReactNode }) {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();
  const { locale, setLocale, t } = useTranslation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <>
      <StyledHeader>
        <StyledLogo to="/readings">{t('layout.logo')}</StyledLogo>
        <StyledUserInfo>
          <StyledThemeToggle
            onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
            aria-label="Toggle language"
          >
            {locale === 'en' ? 'ES' : 'EN'}
          </StyledThemeToggle>
          <StyledThemeToggle onClick={toggleTheme} aria-label="Toggle theme">
            {mode === 'light' ? '☾' : '☀'}
          </StyledThemeToggle>
          {currentUser && (
            <>
              <span>{currentUser.name}</span>
              <StyledRoleBadge $role={currentUser.role}>{currentUser.role}</StyledRoleBadge>
              <StyledLogoutButton onClick={handleLogout}>
                {t('layout.switchUser')}
              </StyledLogoutButton>
            </>
          )}
        </StyledUserInfo>
      </StyledHeader>
      <StyledMain>{children}</StyledMain>
    </>
  );
}
