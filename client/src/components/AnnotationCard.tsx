import { useState } from 'react';
import styled from 'styled-components';
import {
  useCreateAnnotationMutation,
  useUpdateAnnotationMutation,
  useDeleteAnnotationMutation,
} from '../app/api';
import type { Annotation } from '../app/types';
import { useTranslation } from '../i18n';
import { StyledButton, StyledCancelButton, StyledActionButton, StyledDeleteButton } from './Button';
import { StyledCard as StyledCardBase } from './Card';
import { StyledTextarea, StyledFormActions } from './FormElements';

const StyledAnnotationCard = styled(StyledCardBase)`
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StyledAuthor = styled.span`
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const StyledTime = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const StyledContent = styled.p`
  font-size: ${({ theme }) => theme.fontSize.base};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const StyledEditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StyledEditInput = styled(StyledTextarea)`
  border-color: ${({ theme }) => theme.colors.borderFocus};
  margin-bottom: 0;
  min-height: 60px;
  padding: ${({ theme }) => theme.spacing.sm};
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

const StyledReplyInput = styled(StyledTextarea)`
  flex: 1;
  width: auto;
  margin-bottom: 0;
  min-height: 40px;
  padding: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSize.sm};
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

interface AnnotationCardProps {
  annotation: Annotation;
  isOwner: boolean;
  isStudent: boolean;
  currentUserId: string | undefined;
  readingId: string;
}

export function AnnotationCard({
  annotation,
  isOwner,
  isStudent,
  currentUserId,
  readingId,
}: AnnotationCardProps) {
  const { t } = useTranslation();
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
        <StyledHeader>
          <StyledAuthor>{annotation.author.name}</StyledAuthor>
          <StyledTime>{new Date(annotation.createdAt).toLocaleString()}</StyledTime>
        </StyledHeader>

        {isEditing ? (
          <StyledEditForm onSubmit={handleSave}>
            <StyledEditInput
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              aria-label={t('annotation.editLabel')}
            />
            <StyledFormActions>
              <StyledEditCancelButton
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(annotation.content);
                }}
              >
                {t('annotation.cancel')}
              </StyledEditCancelButton>
              <StyledSaveButton type="submit" disabled={isSaving || !editContent.trim()}>
                {isSaving ? t('annotation.saving') : t('annotation.save')}
              </StyledSaveButton>
            </StyledFormActions>
          </StyledEditForm>
        ) : (
          <>
            <StyledContent>{annotation.content}</StyledContent>
            <StyledActions>
              {confirmDelete ? (
                <>
                  <span style={{ fontSize: '0.75rem' }}>{t('annotation.deleteConfirm')}</span>
                  <StyledDeleteButton onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? t('annotation.deleting') : t('annotation.yes')}
                  </StyledDeleteButton>
                  <StyledActionButton onClick={() => setConfirmDelete(false)}>
                    {t('annotation.no')}
                  </StyledActionButton>
                </>
              ) : (
                <>
                  {isOwner && (
                    <>
                      <StyledActionButton onClick={() => setIsEditing(true)}>
                        {t('annotation.edit')}
                      </StyledActionButton>
                      <StyledDeleteButton onClick={() => setConfirmDelete(true)}>
                        {t('annotation.delete')}
                      </StyledDeleteButton>
                    </>
                  )}
                  {isStudent && !isReplying && (
                    <StyledActionButton onClick={() => setIsReplying(true)}>
                      {t('annotation.reply')}
                    </StyledActionButton>
                  )}
                </>
              )}
            </StyledActions>
          </>
        )}
      </StyledAnnotationCard>

      {isReplying && (
        <StyledReplyForm onSubmit={handleReply}>
          <StyledReplyInput
            placeholder={t('annotation.replyTo', { name: annotation.author.name })}
            aria-label={t('annotation.replyTo', { name: annotation.author.name })}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <StyledReplyActions>
            <StyledReplySubmitButton
              type="submit"
              disabled={isSubmittingReply || !replyContent.trim()}
            >
              {isSubmittingReply ? t('annotation.replyPosting') : t('annotation.reply')}
            </StyledReplySubmitButton>
            <StyledCancelButton
              type="button"
              onClick={() => {
                setIsReplying(false);
                setReplyContent('');
              }}
            >
              {t('annotation.cancel')}
            </StyledCancelButton>
          </StyledReplyActions>
        </StyledReplyForm>
      )}

      {annotation.replies && annotation.replies.length > 0 && (
        <StyledReplies
          role="group"
          aria-label={t('annotation.repliesTo', { name: annotation.author.name })}
        >
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
