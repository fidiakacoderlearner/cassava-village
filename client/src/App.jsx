import { Navigate, Route, Routes, useLocation } from 'react-router';
import { useAuth } from './context/AuthContext.jsx';
import { useProgress } from './context/ProgressContext.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Exploration from './pages/Exploration.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brown-200 border-t-brown-800" />
    </div>
  );
}

function RequireAuth({ children }) {
  const { isAuthed, user } = useAuth();
  const location = useLocation();
  if (!isAuthed) {
    const loggingOut = sessionStorage.getItem('cv_logging_out') === '1';
    if (loggingOut) sessionStorage.removeItem('cv_logging_out');
    return (
      <Navigate to="/login" state={loggingOut ? undefined : { from: location }} replace />
    );
  }
  return children;
}

function StudentOnly({ children }) {
  const { user } = useAuth();
  if (user?.role === 'teacher') return <Navigate to="/teacher" replace />;
  return children;
}

function RequireUnlocked({ flag, fallback, children }) {
  const { loading, [flag]: ok } = useProgress();
  if (loading) return <Spinner />;
  if (!ok) return <Navigate to={fallback} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
      <Route
        path="/about"
        element={
          <RequireAuth>
            <StudentOnly>
              <About />
            </StudentOnly>
          </RequireAuth>
        }
      />
      <Route
        path="/exploration"
        element={
          <RequireAuth>
            <StudentOnly>
              <RequireUnlocked flag="aboutDone" fallback="/about">
                <Exploration />
              </RequireUnlocked>
            </StudentOnly>
          </RequireAuth>
        }
      />
      <Route path="/evaluation" element={<Navigate to="/" replace />} />
      <Route
        path="/teacher"
        element={
          <RequireAuth>
            <TeacherDashboard />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
