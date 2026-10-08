import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
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

// Wrapper para forzar re-mount cuando cambia el ID del artista
function ArtistPageWrapper() {
  const { id } = useParams<{ id: string }>();
  return <ArtistPage key={id} />;
}

// Wrapper para forzar re-mount cuando cambia el ID de la playlist
function PlaylistPageWrapper() {
  const { id } = useParams<{ id: string }>();
  return <PlaylistPage key={id} />;
}

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
  const { fetchPlaylists, fetchLikes, fetchHistory, fetchFollowedArtists, fetchSavedAlbums } = useLibraryStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (user) {
      fetchPlaylists();
      fetchLikes();
      fetchHistory();
      fetchFollowedArtists();
      fetchSavedAlbums();
    }
  }, [user, fetchPlaylists, fetchLikes, fetchHistory, fetchFollowedArtists, fetchSavedAlbums]);

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
          <Route path="/playlist/:id" element={<PlaylistPageWrapper />} />
          <Route path="/artist/:id" element={<ArtistPageWrapper />} />
          <Route path="/genre/:genre" element={<GenrePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
