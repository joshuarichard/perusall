import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { useAppSelector } from './app/hooks';
import { Layout } from './components';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ReadingDetailPage from './pages/ReadingDetailPage';
import ReadingsPage from './pages/ReadingsPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  if (!currentUser) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequireInstructor({ children }: { children: React.ReactNode }) {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.role !== 'instructor') return <Navigate to="/readings" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/readings"
          element={
            <RequireAuth>
              <Layout>
                <ReadingsPage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/readings/:id"
          element={
            <RequireAuth>
              <Layout>
                <ReadingDetailPage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireInstructor>
              <Layout>
                <DashboardPage />
              </Layout>
            </RequireInstructor>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
