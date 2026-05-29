import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard, GuestGuard } from './components/AuthGuard';

import { LoginPage }            from './pages/LoginPage';
import { RegisterPage }         from './pages/RegisterPage';
import { DashboardPage }        from './pages/DashboardPage';
import { UploadPage }           from './pages/UploadPage';
import { FileDetailPage }       from './pages/FileDetailPage';
import { CompressionConfigPage }from './pages/CompressionConfigPage';
import { ComparePage }          from './pages/ComparePage';
import { YoutubePage }          from './pages/YoutubePage';
import { SoundCloudPage }       from './pages/SoundCloudPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Guest routes */}
          <Route path="/login"    element={<GuestGuard><LoginPage /></GuestGuard>} />
          <Route path="/register" element={<GuestGuard><RegisterPage /></GuestGuard>} />

          {/* Protected routes */}
          <Route path="/"                         element={<AuthGuard><DashboardPage /></AuthGuard>} />
          <Route path="/upload"                    element={<AuthGuard><UploadPage /></AuthGuard>} />
          <Route path="/youtube"                   element={<AuthGuard><YoutubePage /></AuthGuard>} />
          <Route path="/soundcloud"                element={<AuthGuard><SoundCloudPage /></AuthGuard>} />
          <Route path="/files/:id"                 element={<AuthGuard><FileDetailPage /></AuthGuard>} />
          <Route path="/files/:id/compress"        element={<AuthGuard><CompressionConfigPage /></AuthGuard>} />
          <Route path="/files/:id/compare"         element={<AuthGuard><ComparePage /></AuthGuard>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
