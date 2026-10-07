import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useLibraryStore } from './store/libraryStore';
import { MainLayout } from './components/layout/MainLayout';
import { Home } from './pages/Home';
import { SearchPage } from './pages/Search';
import { LibraryPage } from './pages/Library';
import { PlaylistPage } from './pages/Playlist';
import { ArtistPage } from './pages/Artist';
import { ProfilePage } from './pages/Profile';
import { GenrePage } from './pages/Genre';
import { AuthPage } from './pages/Auth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  
  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#08080C] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const { initialize, user } = useAuthStore();
  const { fetchPlaylists, fetchLikes, fetchHistory } = useLibraryStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (user) {
      fetchPlaylists();
      fetchLikes();
      fetchHistory();
    }
  }, [user, fetchPlaylists, fetchLikes, fetchHistory]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={
          user ? <Navigate to="/" replace /> : <AuthPage />
        } />
        
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/playlist/:id" element={<PlaylistPage />} />
          <Route path="/artist/:id" element={<ArtistPage />} />
          <Route path="/genre/:genre" element={<GenrePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
