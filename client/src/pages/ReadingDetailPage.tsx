import { useState } from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import {
  useGetReadingQuery,
  useGetReadingStatsQuery,
  useCreateAnnotationMutation,
} from '../app/api';

const StyledBackLink = styled(Link)`
  display: inline-block;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const StyledReadingHeader = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
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

const StyledSectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StyledAnnotationForm = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StyledAnnotationInput = styled.textarea`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-family: inherit;
  min-height: 60px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.borderFocus};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const StyledSubmitButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  cursor: pointer;
  align-self: flex-end;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StyledAnnotationCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StyledAnnotationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StyledAnnotationAuthor = styled.span`
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const StyledAnnotationTime = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const StyledAnnotationContent = styled.p`
  font-size: ${({ theme }) => theme.fontSize.base};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
`;

const StyledEmptyAnnotations = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const StyledErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export default function ReadingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const { data: reading, isLoading, error } = useGetReadingQuery(id!);
  const { data: stats } = useGetReadingStatsQuery(id!);
  const [createAnnotation, { isLoading: isSubmitting }] = useCreateAnnotationMutation();

  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');

  const isStudent = currentUser?.role === 'student';
  const isInstructor = currentUser?.role === 'instructor';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!content.trim()) {
      setFormError('Annotation cannot be empty.');
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
      setFormError('Failed to post annotation. Please try again.');
    }
  };

  if (isLoading) return <p>Loading reading...</p>;
  if (error || !reading) return <p>Reading not found.</p>;

  return (
    <>
      <StyledBackLink to="/readings">&larr; Back to Readings</StyledBackLink>

      <StyledReadingHeader>
        <StyledTitle>{reading.title}</StyledTitle>
        <StyledDescription>{reading.description}</StyledDescription>
        <StyledMeta>
          Assigned by {reading.creator.name} &middot;{' '}
          {new Date(reading.createdAt).toLocaleDateString()}
        </StyledMeta>
      </StyledReadingHeader>

      {isInstructor && stats && (
        <StyledStatsBar>
          <StyledStat>
            <StyledStatValue>{stats.annotationCount}</StyledStatValue>
            <StyledStatLabel>Annotations</StyledStatLabel>
          </StyledStat>
          <StyledStat>
            <StyledStatValue>{stats.uniqueStudents}</StyledStatValue>
            <StyledStatLabel>Students Participating</StyledStatLabel>
          </StyledStat>
        </StyledStatsBar>
      )}

      <StyledAnnotationsSection>
        <StyledSectionTitle>Discussion ({reading.annotations.length})</StyledSectionTitle>

        {isStudent && (
          <>
            {formError && <StyledErrorMessage>{formError}</StyledErrorMessage>}
            <StyledAnnotationForm onSubmit={handleSubmit}>
              <StyledAnnotationInput
                placeholder="Share your thoughts on this reading..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <StyledSubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Posting...' : 'Post'}
              </StyledSubmitButton>
            </StyledAnnotationForm>
          </>
        )}

        {reading.annotations.length === 0 ? (
          <StyledEmptyAnnotations>
            <p>No annotations yet.</p>
            {isStudent && <p>Be the first to share your thoughts!</p>}
          </StyledEmptyAnnotations>
        ) : (
          reading.annotations.map((annotation) => (
            <StyledAnnotationCard key={annotation.id}>
              <StyledAnnotationHeader>
                <StyledAnnotationAuthor>{annotation.author.name}</StyledAnnotationAuthor>
                <StyledAnnotationTime>
                  {new Date(annotation.createdAt).toLocaleString()}
                </StyledAnnotationTime>
              </StyledAnnotationHeader>
              <StyledAnnotationContent>{annotation.content}</StyledAnnotationContent>
            </StyledAnnotationCard>
          ))
        )}
      </StyledAnnotationsSection>
    </>
  );
}
