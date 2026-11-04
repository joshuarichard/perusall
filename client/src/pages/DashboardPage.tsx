import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useGetDashboardQuery } from '../app/api';
import { useTranslation } from '../i18n';
import { StyledPageHeader, StyledPageTitle } from '../components';

const StyledSummaryRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StyledSummaryCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const StyledSummaryValue = styled.div`
  font-size: ${({ theme }) => theme.fontSize.xxxl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const StyledSummaryLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const StyledSection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StyledSectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const StyledTh = styled.th<{ $sortable?: boolean }>`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: ${({ $sortable }) => ($sortable ? 'pointer' : 'default')};
  user-select: none;

  &:hover {
    color: ${({ $sortable, theme }) => ($sortable ? theme.colors.text : undefined)};
  }
`;

const StyledTd = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSize.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const StyledClickableRow = styled.tr`
  cursor: pointer;
  transition: background 0.1s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &:last-child ${StyledTd} {
    border-bottom: none;
  }
`;

const StyledRow = styled.tr`
  &:last-child ${StyledTd} {
    border-bottom: none;
  }
`;

const StyledNoData = styled.td`
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

type ReadingSortKey = 'title' | 'annotationCount' | 'uniqueStudents' | 'lastActivity';
type StudentSortKey = 'name' | 'annotationCount' | 'readingsParticipated';

export default function DashboardPage() {
  const { data, isLoading, error } = useGetDashboardQuery();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [readingSort, setReadingSort] = useState<{ key: ReadingSortKey; desc: boolean }>({
    key: 'annotationCount',
    desc: true,
  });
  const [studentSort, setStudentSort] = useState<{ key: StudentSortKey; desc: boolean }>({
    key: 'annotationCount',
    desc: true,
  });

  const toggleReadingSort = (key: ReadingSortKey) => {
    setReadingSort((prev) => ({
      key,
      desc: prev.key === key ? !prev.desc : true,
    }));
  };

  const toggleStudentSort = (key: StudentSortKey) => {
    setStudentSort((prev) => ({
      key,
      desc: prev.key === key ? !prev.desc : true,
    }));
  };

  const sortIndicator = (active: boolean, desc: boolean) => (active ? (desc ? ' ↓' : ' ↑') : '');

  if (isLoading) return <p>{t('dashboard.loading')}</p>;
  if (error || !data) return <p>{t('dashboard.error')}</p>;

  const sortedReadings = [...data.readings].sort((a, b) => {
    const dir = readingSort.desc ? -1 : 1;
    const key = readingSort.key;
    if (key === 'title') return dir * a.title.localeCompare(b.title);
    if (key === 'lastActivity') {
      if (!a.lastActivity && !b.lastActivity) return 0;
      if (!a.lastActivity) return 1;
      if (!b.lastActivity) return -1;
      return dir * (new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime());
    }
    return dir * (a[key] - b[key]);
  });

  const sortedStudents = [...data.students].sort((a, b) => {
    const dir = studentSort.desc ? -1 : 1;
    const key = studentSort.key;
    if (key === 'name') return dir * a.name.localeCompare(b.name);
    return dir * (a[key] - b[key]);
  });

  return (
    <>
      <StyledPageHeader>
        <StyledPageTitle>{t('dashboard.title')}</StyledPageTitle>
      </StyledPageHeader>

      <StyledSummaryRow>
        <StyledSummaryCard>
          <StyledSummaryValue>{data.summary.totalReadings}</StyledSummaryValue>
          <StyledSummaryLabel>{t('dashboard.totalReadings')}</StyledSummaryLabel>
        </StyledSummaryCard>
        <StyledSummaryCard>
          <StyledSummaryValue>{data.summary.totalAnnotations}</StyledSummaryValue>
          <StyledSummaryLabel>{t('dashboard.totalAnnotations')}</StyledSummaryLabel>
        </StyledSummaryCard>
        <StyledSummaryCard>
          <StyledSummaryValue>{data.summary.uniqueStudents}</StyledSummaryValue>
          <StyledSummaryLabel>{t('dashboard.uniqueStudents')}</StyledSummaryLabel>
        </StyledSummaryCard>
      </StyledSummaryRow>

      <StyledSection>
        <StyledSectionTitle>{t('dashboard.readingsOverview')}</StyledSectionTitle>
        <StyledTable>
          <thead>
            <tr>
              <StyledTh $sortable onClick={() => toggleReadingSort('title')}>
                {t('dashboard.reading')}
                {sortIndicator(readingSort.key === 'title', readingSort.desc)}
              </StyledTh>
              <StyledTh $sortable onClick={() => toggleReadingSort('annotationCount')}>
                {t('dashboard.annotations')}
                {sortIndicator(readingSort.key === 'annotationCount', readingSort.desc)}
              </StyledTh>
              <StyledTh $sortable onClick={() => toggleReadingSort('uniqueStudents')}>
                {t('dashboard.students')}
                {sortIndicator(readingSort.key === 'uniqueStudents', readingSort.desc)}
              </StyledTh>
              <StyledTh $sortable onClick={() => toggleReadingSort('lastActivity')}>
                {t('dashboard.lastActivity')}
                {sortIndicator(readingSort.key === 'lastActivity', readingSort.desc)}
              </StyledTh>
            </tr>
          </thead>
          <tbody>
            {sortedReadings.length === 0 ? (
              <tr>
                <StyledNoData colSpan={4}>{t('dashboard.noReadings')}</StyledNoData>
              </tr>
            ) : (
              sortedReadings.map((r) => (
                <StyledClickableRow
                  key={r.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(`/readings/${r.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/readings/${r.id}`);
                    }
                  }}
                >
                  <StyledTd>{r.title}</StyledTd>
                  <StyledTd>{r.annotationCount}</StyledTd>
                  <StyledTd>{r.uniqueStudents}</StyledTd>
                  <StyledTd>
                    {r.lastActivity ? new Date(r.lastActivity).toLocaleDateString() : '—'}
                  </StyledTd>
                </StyledClickableRow>
              ))
            )}
          </tbody>
        </StyledTable>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t('dashboard.studentParticipation')}</StyledSectionTitle>
        <StyledTable>
          <thead>
            <tr>
              <StyledTh $sortable onClick={() => toggleStudentSort('name')}>
                {t('dashboard.student')}
                {sortIndicator(studentSort.key === 'name', studentSort.desc)}
              </StyledTh>
              <StyledTh $sortable onClick={() => toggleStudentSort('annotationCount')}>
                {t('dashboard.annotations')}
                {sortIndicator(studentSort.key === 'annotationCount', studentSort.desc)}
              </StyledTh>
              <StyledTh $sortable onClick={() => toggleStudentSort('readingsParticipated')}>
                {t('dashboard.readingsParticipated')}
                {sortIndicator(studentSort.key === 'readingsParticipated', studentSort.desc)}
              </StyledTh>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.length === 0 ? (
              <tr>
                <StyledNoData colSpan={3}>{t('dashboard.noStudents')}</StyledNoData>
              </tr>
            ) : (
              sortedStudents.map((s) => (
                <StyledRow key={s.id}>
                  <StyledTd>{s.name}</StyledTd>
                  <StyledTd>{s.annotationCount}</StyledTd>
                  <StyledTd>{s.readingsParticipated}</StyledTd>
                </StyledRow>
              ))
            )}
          </tbody>
        </StyledTable>
      </StyledSection>
    </>
  );
}
