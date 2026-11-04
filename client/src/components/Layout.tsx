import styled from 'styled-components';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { logout } from '../app/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { useThemeMode } from '../styles';
import { useTranslation, type Locale } from '../i18n';

const StyledHeader = styled.header`
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledLogo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
`;

const StyledLogoImage = styled.img`
  height: 28px;
  width: auto;
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
  color: ${({ theme }) => theme.colors.text};
  line-height: 1;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const StyledLanguageSelect = styled.select`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.borderFocus};
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
      <a href="#main-content" className="skip-link">
        {t('layout.skipToContent')}
      </a>
      <StyledHeader>
        <StyledLogo to="/readings">
          <StyledLogoImage src="/perusall-logo.png" alt="Perusall" />
        </StyledLogo>
        <StyledUserInfo>
          <StyledLanguageSelect
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            aria-label="Select language"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
          </StyledLanguageSelect>
          <StyledThemeToggle onClick={toggleTheme} aria-label="Toggle theme">
            {mode === 'light' ? '☾' : '☀'}
          </StyledThemeToggle>
          {currentUser && (
            <>
              <span>{currentUser.name}</span>
              <StyledRoleBadge $role={currentUser.role}>
                {t(`role.${currentUser.role}`)}
              </StyledRoleBadge>
              <StyledLogoutButton onClick={handleLogout}>
                {t('layout.switchUser')}
              </StyledLogoutButton>
            </>
          )}
        </StyledUserInfo>
      </StyledHeader>
      <StyledMain id="main-content">{children}</StyledMain>
    </>
  );
}
