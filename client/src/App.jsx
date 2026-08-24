import { Navigate, Route, Routes, useLocation } from 'react-router';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Exploration from './pages/Exploration.jsx';
import Evaluation from './pages/Evaluation.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';

function RequireAuth({ children }) {
  const { isAuthed } = useAuth();
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
  if (user?.role === 'student' && !user?.class_id) return <Navigate to="/login" state={{ joinClass: true }} replace />;
  return children;
}

function StudentHome() {
  const { user } = useAuth();
  if (user?.role === 'teacher') return <Navigate to="/teacher" replace />;
  if (!user?.class_id) return <Navigate to="/login" state={{ joinClass: true }} replace />;
  return <Home />;
}

function TeacherOnly({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'teacher') return <Navigate to="/" replace />;
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
            <StudentHome />
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
              <Exploration />
            </StudentOnly>
          </RequireAuth>
        }
      />
      <Route
        path="/evaluation"
        element={
          <RequireAuth>
            <StudentOnly>
              <Evaluation />
            </StudentOnly>
          </RequireAuth>
        }
      />
      <Route
        path="/teacher"
        element={
          <RequireAuth>
            <TeacherOnly>
              <TeacherDashboard />
            </TeacherOnly>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
