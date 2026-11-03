import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './app/hooks';
import { Layout } from './components/Layout';
import LoginPage from './pages/LoginPage';
import ReadingsPage from './pages/ReadingsPage';
import ReadingDetailPage from './pages/ReadingDetailPage';

// Redirect to login if no user is selected
function RequireAuth({ children }: { children: React.ReactNode }) {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  if (!currentUser) return <Navigate to="/" replace />;
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
      </Routes>
    </BrowserRouter>
  );
}
