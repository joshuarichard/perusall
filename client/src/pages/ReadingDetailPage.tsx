import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import {
  useGetReadingQuery,
  useGetReadingStatsQuery,
  useCreateAnnotationMutation,
  useUpdateAnnotationMutation,
  useDeleteAnnotationMutation,
} from '../app/api';
import type { Annotation } from '../app/types';
import {
  StyledButton,
  StyledCancelButton,
  StyledActionButton,
  StyledDeleteButton,
} from '../components/Button';
import { StyledErrorMessage } from '../components/FormElements';
import { StyledEmptyStateCard } from '../components/EmptyState';
import { StyledCard } from '../components/Card';

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

const StyledAnnotationInput = styled.textarea`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-family: inherit;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  min-height: 60px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.borderFocus};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const StyledSubmitButton = styled(StyledButton)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  align-self: flex-end;
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

const StyledAnnotationActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const StyledEditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StyledEditInput = styled.textarea`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderFocus};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-family: inherit;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  min-height: 60px;
  resize: vertical;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const StyledEditActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
`;

const StyledSaveButton = styled(StyledButton)`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
`;

const StyledEditCancelButton = styled(StyledCancelButton)`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
`;

const StyledReplies = styled.div`
  margin-left: ${({ theme }) => theme.spacing.xl};
  margin-top: ${({ theme }) => theme.spacing.xs};
  border-left: 2px solid ${({ theme }) => theme.colors.border};
  padding-left: ${({ theme }) => theme.spacing.md};
`;

const StyledReplyForm = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  margin-left: ${({ theme }) => theme.spacing.xl};
  padding-left: ${({ theme }) => theme.spacing.md};
`;

const StyledReplyInput = styled.textarea`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-family: inherit;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  min-height: 40px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.borderFocus};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const StyledReplyActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  align-self: flex-end;
`;

const StyledReplySubmitButton = styled(StyledButton)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
`;

function AnnotationCard({
  annotation,
  isOwner,
  isStudent,
  currentUserId,
  readingId,
}: {
  annotation: Annotation;
  isOwner: boolean;
  isStudent: boolean;
  currentUserId: string | undefined;
  readingId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(annotation.content);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [updateAnnotation, { isLoading: isSaving }] = useUpdateAnnotationMutation();
  const [deleteAnnotation, { isLoading: isDeleting }] = useDeleteAnnotationMutation();
  const [createAnnotation, { isLoading: isSubmittingReply }] = useCreateAnnotationMutation();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    try {
      await updateAnnotation({
        id: annotation.id,
        content: editContent.trim(),
        authorId: annotation.authorId,
        readingId,
      }).unwrap();
      setIsEditing(false);
    } catch {
      // RTK Query will refetch on failure, keep edit mode open
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAnnotation({
        id: annotation.id,
        authorId: annotation.authorId,
        readingId,
      }).unwrap();
    } catch {
      setConfirmDelete(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !currentUserId) return;
    try {
      await createAnnotation({
        content: replyContent.trim(),
        readingId,
        authorId: currentUserId,
        parentId: annotation.id,
      }).unwrap();
      setReplyContent('');
      setIsReplying(false);
    } catch {
      // keep reply form open on failure
    }
  };

  return (
    <>
      <StyledAnnotationCard>
        <StyledAnnotationHeader>
          <StyledAnnotationAuthor>{annotation.author.name}</StyledAnnotationAuthor>
          <StyledAnnotationTime>
            {new Date(annotation.createdAt).toLocaleString()}
          </StyledAnnotationTime>
        </StyledAnnotationHeader>

        {isEditing ? (
          <StyledEditForm onSubmit={handleSave}>
            <StyledEditInput value={editContent} onChange={(e) => setEditContent(e.target.value)} />
            <StyledEditActions>
              <StyledEditCancelButton
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(annotation.content);
                }}
              >
                Cancel
              </StyledEditCancelButton>
              <StyledSaveButton type="submit" disabled={isSaving || !editContent.trim()}>
                {isSaving ? 'Saving...' : 'Save'}
              </StyledSaveButton>
            </StyledEditActions>
          </StyledEditForm>
        ) : (
          <>
            <StyledAnnotationContent>{annotation.content}</StyledAnnotationContent>
            <StyledAnnotationActions>
              {confirmDelete ? (
                <>
                  <span style={{ fontSize: '0.75rem' }}>Delete?</span>
                  <StyledDeleteButton onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Yes'}
                  </StyledDeleteButton>
                  <StyledActionButton onClick={() => setConfirmDelete(false)}>
                    No
                  </StyledActionButton>
                </>
              ) : (
                <>
                  {isOwner && (
                    <>
                      <StyledActionButton onClick={() => setIsEditing(true)}>
                        Edit
                      </StyledActionButton>
                      <StyledDeleteButton onClick={() => setConfirmDelete(true)}>
                        Delete
                      </StyledDeleteButton>
                    </>
                  )}
                  {isStudent && !isReplying && (
                    <StyledActionButton onClick={() => setIsReplying(true)}>
                      Reply
                    </StyledActionButton>
                  )}
                </>
              )}
            </StyledAnnotationActions>
          </>
        )}
      </StyledAnnotationCard>

      {isReplying && (
        <StyledReplyForm onSubmit={handleReply}>
          <StyledReplyInput
            placeholder={`Reply to ${annotation.author.name}...`}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <StyledReplyActions>
            <StyledReplySubmitButton
              type="submit"
              disabled={isSubmittingReply || !replyContent.trim()}
            >
              {isSubmittingReply ? 'Posting...' : 'Reply'}
            </StyledReplySubmitButton>
            <StyledCancelButton
              type="button"
              onClick={() => {
                setIsReplying(false);
                setReplyContent('');
              }}
            >
              Cancel
            </StyledCancelButton>
          </StyledReplyActions>
        </StyledReplyForm>
      )}

      {annotation.replies && annotation.replies.length > 0 && (
        <StyledReplies>
          {annotation.replies.map((reply) => (
            <AnnotationCard
              key={reply.id}
              annotation={reply}
              isOwner={currentUserId === reply.authorId}
              isStudent={isStudent}
              currentUserId={currentUserId}
              readingId={readingId}
            />
          ))}
        </StyledReplies>
      )}
    </>
  );
}

export default function ReadingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const { data: reading, isLoading, error } = useGetReadingQuery(id!);
  const { data: stats } = useGetReadingStatsQuery(id!);
  const [createAnnotation, { isLoading: isSubmitting }] = useCreateAnnotationMutation();

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
        <StyledSectionHeader>
          <StyledSectionTitle>
            Discussion ({filteredCount}
            {filterAuthorId && ` of ${totalAnnotationCount}`})
          </StyledSectionTitle>
          {totalAnnotationCount > 0 && (
            <StyledFilterSelect
              value={filterAuthorId}
              onChange={(e) => setFilterAuthorId(e.target.value)}
            >
              <option value="">All students</option>
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

        {filteredAnnotations.length === 0 ? (
          <StyledEmptyStateCard>
            {reading.annotations.length === 0 ? (
              <>
                <p>No annotations yet.</p>
                {isStudent && <p>Be the first to share your thoughts!</p>}
              </>
            ) : (
              <p>No annotations from this student.</p>
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
