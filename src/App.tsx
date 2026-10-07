import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Home } from './pages/Home';
import { SearchPage } from './pages/Search';
import { LibraryPage } from './pages/Library';
import { PlaylistPage } from './pages/Playlist';
import { ArtistPage } from './pages/Artist';
import { ProfilePage } from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/playlist/:id" element={<PlaylistPage />} />
          <Route path="/artist/:id" element={<ArtistPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
