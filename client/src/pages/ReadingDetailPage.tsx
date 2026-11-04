import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import {
  useGetReadingQuery,
  useGetReadingStatsQuery,
  useCreateAnnotationMutation,
} from '../app/api';
import type { Annotation } from '../app/types';
import { useTranslation } from '../i18n';
import {
  AnnotationCard,
  StyledButton,
  StyledTextarea,
  StyledErrorMessage,
  StyledEmptyStateCard,
  StyledCard,
} from '../components';

const StyledBackLink = styled(Link)`
  display: inline-block;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const StyledReadingHeader = styled(StyledCard)`
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StyledTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSize.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StyledDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.8;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StyledMeta = styled.div`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const StyledStatsBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.primaryLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StyledStat = styled.div`
  text-align: center;
`;

const StyledStatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSize.xxl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const StyledStatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StyledAnnotationsSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const StyledSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StyledSectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.lg};
`;

const StyledFilterSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.borderFocus};
  }
`;

const StyledAnnotationForm = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StyledAnnotationInput = styled(StyledTextarea)`
  flex: 1;
  width: auto;
  margin-bottom: 0;
  min-height: 60px;
  padding: ${({ theme }) => theme.spacing.md};
`;

const StyledSubmitButton = styled(StyledButton)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  align-self: flex-end;
`;

export default function ReadingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const { data: reading, isLoading, error } = useGetReadingQuery(id!);
  const { data: stats } = useGetReadingStatsQuery(id!);
  const [createAnnotation, { isLoading: isSubmitting }] = useCreateAnnotationMutation();

  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');
  const [filterAuthorId, setFilterAuthorId] = useState('');

  const isStudent = currentUser?.role === 'student';
  const isInstructor = currentUser?.role === 'instructor';

  const collectAuthors = (annotations: Annotation[], seen: Map<string, string>) => {
    for (const a of annotations) {
      if (!seen.has(a.author.id)) seen.set(a.author.id, a.author.name);
      collectAuthors(a.replies ?? [], seen);
    }
  };

  const uniqueAuthors = useMemo(() => {
    if (!reading) return [];
    const seen = new Map<string, string>();
    collectAuthors(reading.annotations, seen);
    return Array.from(seen, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [reading]);

  const hasAuthor = (annotation: Annotation, authorId: string): boolean =>
    annotation.author.id === authorId ||
    (annotation.replies ?? []).some((r) => hasAuthor(r, authorId));

  const filteredAnnotations = useMemo(() => {
    if (!reading) return [];
    if (!filterAuthorId) return reading.annotations;
    return reading.annotations.filter((a) => hasAuthor(a, filterAuthorId));
  }, [reading, filterAuthorId]);

  const countAll = (annotations: Annotation[]): number =>
    annotations.reduce((sum, a) => sum + 1 + countAll(a.replies ?? []), 0);

  const totalAnnotationCount = useMemo(() => {
    if (!reading) return 0;
    return countAll(reading.annotations);
  }, [reading]);

  const filteredCount = useMemo(() => countAll(filteredAnnotations), [filteredAnnotations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!content.trim()) {
      setFormError(t('detail.annotationEmpty'));
      return;
    }

    try {
      await createAnnotation({
        content: content.trim(),
        readingId: id!,
        authorId: currentUser!.id,
      }).unwrap();
      setContent('');
    } catch {
      setFormError(t('detail.postError'));
    }
  };

  if (isLoading) return <p>{t('detail.loading')}</p>;
  if (error || !reading) return <p>{t('detail.notFound')}</p>;

  return (
    <>
      <StyledBackLink to="/readings">&larr; {t('detail.backToReadings')}</StyledBackLink>

      <StyledReadingHeader>
        <StyledTitle>{reading.title}</StyledTitle>
        <StyledDescription>{reading.description}</StyledDescription>
        <StyledMeta>
          {t('detail.assignedBy', { name: reading.creator.name })} &middot;{' '}
          {new Date(reading.createdAt).toLocaleDateString()}
        </StyledMeta>
      </StyledReadingHeader>

      {isInstructor && stats && (
        <StyledStatsBar>
          <StyledStat>
            <StyledStatValue>{stats.annotationCount}</StyledStatValue>
            <StyledStatLabel>{t('detail.annotations')}</StyledStatLabel>
          </StyledStat>
          <StyledStat>
            <StyledStatValue>{stats.uniqueStudents}</StyledStatValue>
            <StyledStatLabel>{t('detail.studentsParticipating')}</StyledStatLabel>
          </StyledStat>
        </StyledStatsBar>
      )}

      <StyledAnnotationsSection>
        <StyledSectionHeader>
          <StyledSectionTitle>
            {t('detail.discussion')} ({filteredCount}
            {filterAuthorId && ` of ${totalAnnotationCount}`})
          </StyledSectionTitle>
          {totalAnnotationCount > 0 && (
            <StyledFilterSelect
              value={filterAuthorId}
              onChange={(e) => setFilterAuthorId(e.target.value)}
              aria-label={t('detail.filterByStudent')}
            >
              <option value="">{t('detail.allStudents')}</option>
              {uniqueAuthors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </StyledFilterSelect>
          )}
        </StyledSectionHeader>

        {isStudent && (
          <>
            {formError && <StyledErrorMessage>{formError}</StyledErrorMessage>}
            <StyledAnnotationForm onSubmit={handleSubmit}>
              <StyledAnnotationInput
                placeholder={t('detail.sharePlaceholder')}
                aria-label={t('detail.sharePlaceholder')}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <StyledSubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('detail.posting') : t('detail.post')}
              </StyledSubmitButton>
            </StyledAnnotationForm>
          </>
        )}

        {filteredAnnotations.length === 0 ? (
          <StyledEmptyStateCard>
            {reading.annotations.length === 0 ? (
              <>
                <p>{t('detail.emptyAnnotations')}</p>
                {isStudent && <p>{t('detail.beFirst')}</p>}
              </>
            ) : (
              <p>{t('detail.noAnnotationsFromStudent')}</p>
            )}
          </StyledEmptyStateCard>
        ) : (
          filteredAnnotations.map((annotation) => (
            <AnnotationCard
              key={annotation.id}
              annotation={annotation}
              isOwner={currentUser?.id === annotation.authorId}
              isStudent={!!isStudent}
              currentUserId={currentUser?.id}
              readingId={id!}
            />
          ))
        )}
      </StyledAnnotationsSection>
    </>
  );
}
