import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { useGetReadingsQuery, useCreateReadingMutation } from '../app/api';
import { useTranslation } from '../i18n';
import {
  StyledButton,
  StyledCancelButton,
  StyledInput,
  StyledTextarea,
  StyledFormActions,
  StyledErrorMessage,
  StyledEmptyState,
  StyledClickableCard,
  StyledPageHeader,
  StyledPageTitle,
  StyledSuccessMessage,
} from '../components';

const StyledReadingTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StyledReadingDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StyledReadingMeta = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const StyledForm = styled.form`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StyledFormTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StyledSearchInput = styled(StyledInput)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export default function ReadingsPage() {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const navigate = useNavigate();
  const { data: readings, isLoading, error } = useGetReadingsQuery();
  const { t } = useTranslation();
  const [createReading, { isLoading: isCreating }] = useCreateReadingMutation();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const isInstructor = currentUser?.role === 'instructor';

  const filteredReadings = useMemo(() => {
    if (!readings) return [];
    if (!searchQuery.trim()) return readings;
    const query = searchQuery.toLowerCase();
    return readings.filter((r) => r.title.toLowerCase().includes(query));
  }, [readings, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !description.trim()) {
      setFormError(t('readings.formError'));
      return;
    }

    try {
      await createReading({
        title: title.trim(),
        description: description.trim(),
        createdBy: currentUser!.id,
      }).unwrap();

      setTitle('');
      setDescription('');
      setShowForm(false);
      setSuccessMessage(t('readings.createdSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setFormError(t('readings.createError'));
    }
  };

  if (isLoading) return <p>{t('readings.loading')}</p>;
  if (error) return <p>{t('readings.loadError')}</p>;

  return (
    <>
      <StyledPageHeader>
        <StyledPageTitle>{t('readings.title')}</StyledPageTitle>
        {isInstructor && !showForm && (
          <StyledButton onClick={() => setShowForm(true)}>{t('readings.newReading')}</StyledButton>
        )}
      </StyledPageHeader>

      {successMessage && <StyledSuccessMessage>{successMessage}</StyledSuccessMessage>}

      {readings && readings.length > 0 && (
        <StyledSearchInput
          type="text"
          placeholder={t('readings.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      )}

      {showForm && isInstructor && (
        <StyledForm onSubmit={handleSubmit}>
          <StyledFormTitle>{t('readings.createTitle')}</StyledFormTitle>
          {formError && <StyledErrorMessage>{formError}</StyledErrorMessage>}
          <StyledInput
            type="text"
            placeholder={t('readings.titlePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <StyledTextarea
            placeholder={t('readings.descriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <StyledFormActions>
            <StyledCancelButton type="button" onClick={() => setShowForm(false)}>
              {t('readings.cancel')}
            </StyledCancelButton>
            <StyledButton type="submit" disabled={isCreating}>
              {isCreating ? t('readings.creating') : t('readings.create')}
            </StyledButton>
          </StyledFormActions>
        </StyledForm>
      )}

      {filteredReadings.length === 0 ? (
        <StyledEmptyState>
          {readings?.length === 0 ? (
            <>
              <p>{t('readings.empty')}</p>
              {isInstructor && <p>{t('readings.emptyInstructor')}</p>}
            </>
          ) : (
            <p>{t('readings.noMatch')}</p>
          )}
        </StyledEmptyState>
      ) : (
        filteredReadings.map((reading) => (
          <StyledClickableCard key={reading.id} onClick={() => navigate(`/readings/${reading.id}`)}>
            <StyledReadingTitle>{reading.title}</StyledReadingTitle>
            <StyledReadingDescription>{reading.description}</StyledReadingDescription>
            <StyledReadingMeta>
              <span>{t('readings.by', { name: reading.creator.name })}</span>
              <span>
                {reading._count.annotations !== 1
                  ? t('readings.annotationCountPlural', { count: reading._count.annotations })
                  : t('readings.annotationCount', { count: reading._count.annotations })}
              </span>
              <span>{new Date(reading.createdAt).toLocaleDateString()}</span>
            </StyledReadingMeta>
          </StyledClickableCard>
        ))
      )}
    </>
  );
}
