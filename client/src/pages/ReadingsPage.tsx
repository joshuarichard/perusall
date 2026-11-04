import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { useGetReadingsQuery, useCreateReadingMutation } from '../app/api';

const StyledPageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StyledPageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSize.xxl};
`;

const StyledButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StyledReadingCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadow.md};
  }
`;

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

const StyledEmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
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

const StyledInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSize.base};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.borderFocus};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSize.base};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  min-height: 80px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.borderFocus};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const StyledFormActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
`;

const StyledCancelButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSize.sm};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const StyledErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StyledSearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSize.base};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.borderFocus};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const StyledSuccessMessage = styled.div`
  background: #ecfdf5;
  color: ${({ theme }) => theme.colors.success};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

export default function ReadingsPage() {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const navigate = useNavigate();
  const { data: readings, isLoading, error } = useGetReadingsQuery();
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
      setFormError('Both title and description are required.');
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
      setSuccessMessage('Reading created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setFormError('Failed to create reading. Please try again.');
    }
  };

  if (isLoading) return <p>Loading readings...</p>;
  if (error) return <p>Failed to load readings.</p>;

  return (
    <>
      <StyledPageHeader>
        <StyledPageTitle>Readings</StyledPageTitle>
        {isInstructor && !showForm && (
          <StyledButton onClick={() => setShowForm(true)}>+ New Reading</StyledButton>
        )}
      </StyledPageHeader>

      {successMessage && <StyledSuccessMessage>{successMessage}</StyledSuccessMessage>}

      {readings && readings.length > 0 && (
        <StyledSearchInput
          type="text"
          placeholder="Search readings by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      )}

      {showForm && isInstructor && (
        <StyledForm onSubmit={handleSubmit}>
          <StyledFormTitle>Create New Reading</StyledFormTitle>
          {formError && <StyledErrorMessage>{formError}</StyledErrorMessage>}
          <StyledInput
            type="text"
            placeholder="Reading title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <StyledTextarea
            placeholder="Reading description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <StyledFormActions>
            <StyledCancelButton type="button" onClick={() => setShowForm(false)}>
              Cancel
            </StyledCancelButton>
            <StyledButton type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Reading'}
            </StyledButton>
          </StyledFormActions>
        </StyledForm>
      )}

      {filteredReadings.length === 0 ? (
        <StyledEmptyState>
          {readings?.length === 0 ? (
            <>
              <p>No readings yet.</p>
              {isInstructor && <p>Create your first reading to get started.</p>}
            </>
          ) : (
            <p>No readings match your search.</p>
          )}
        </StyledEmptyState>
      ) : (
        filteredReadings.map((reading) => (
          <StyledReadingCard key={reading.id} onClick={() => navigate(`/readings/${reading.id}`)}>
            <StyledReadingTitle>{reading.title}</StyledReadingTitle>
            <StyledReadingDescription>{reading.description}</StyledReadingDescription>
            <StyledReadingMeta>
              <span>By {reading.creator.name}</span>
              <span>
                {reading._count.annotations} annotation{reading._count.annotations !== 1 ? 's' : ''}
              </span>
              <span>{new Date(reading.createdAt).toLocaleDateString()}</span>
            </StyledReadingMeta>
          </StyledReadingCard>
        ))
      )}
    </>
  );
}
