import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';
import Home from './pages/Home';
import SubjectPage from './pages/SubjectPage';
import Login from './pages/Login';
import AdminShell from './components/admin/AdminShell';
import AdminHome from './pages/admin/AdminHome';
import AdminClasses from './pages/admin/AdminClasses';
import AdminSubjects from './pages/admin/AdminSubjects';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/subject/:id" element={<SubjectPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminShell />}>
              <Route index element={<AdminHome />} />
              <Route path="classes" element={<AdminClasses />} />
              <Route path="subjects" element={<AdminSubjects />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
