import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';
import Home from './pages/Home';
import SubjectPage from './pages/SubjectPage';
import Playlist from './pages/Playlist';
import Login from './pages/Login';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/subject/:id" element={<SubjectPage />} />
            <Route path="/subject/:id/playlist" element={<Playlist />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
