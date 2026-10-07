-- ============================================
-- AURAL - Esquema de Base de Datos Supabase
-- ============================================
-- Ejecuta este SQL en el SQL Editor de Supabase
-- Dashboard → SQL Editor → New Query
-- ============================================

-- 1. Tabla de perfiles de usuario
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de playlists
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de tracks en playlists
CREATE TABLE public.playlist_tracks (
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (playlist_id, track_id)
);

-- 4. Tabla de favoritos (likes)
CREATE TABLE public.user_likes (
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  liked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, track_id)
);

-- 5. Historial de reproducción
CREATE TABLE public.listening_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Estado del reproductor
CREATE TABLE public.player_states (
  user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  current_track_id TEXT,
  queue JSONB DEFAULT '[]'::jsonb,
  queue_index INTEGER DEFAULT 0,
  volume NUMERIC DEFAULT 0.7,
  is_muted BOOLEAN DEFAULT FALSE,
  shuffle BOOLEAN DEFAULT FALSE,
  repeat_mode TEXT DEFAULT 'off',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_states ENABLE ROW LEVEL SECURITY;

-- user_profiles: usuarios ven su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- playlists: usuarios ven sus propias playlists + públicas
CREATE POLICY "Users can view own playlists"
  ON public.playlists FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create playlists"
  ON public.playlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists"
  ON public.playlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists"
  ON public.playlists FOR DELETE
  USING (auth.uid() = user_id);

-- playlist_tracks: acceso basado en la playlist
CREATE POLICY "Users can view tracks of accessible playlists"
  ON public.playlist_tracks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_tracks.playlist_id
      AND (playlists.user_id = auth.uid() OR playlists.is_public = TRUE)
    )
  );

CREATE POLICY "Users can manage tracks in own playlists"
  ON public.playlist_tracks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_tracks.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

-- user_likes: usuarios ven sus propios likes
CREATE POLICY "Users can view own likes"
  ON public.user_likes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own likes"
  ON public.user_likes FOR ALL
  USING (auth.uid() = user_id);

-- listening_history: usuarios ven su propio historial
CREATE POLICY "Users can view own history"
  ON public.listening_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON public.listening_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
  ON public.listening_history FOR DELETE
  USING (auth.uid() = user_id);

-- player_states: usuarios ven su propio estado
CREATE POLICY "Users can view own player state"
  ON public.player_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own player state"
  ON public.player_states FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Crear estado inicial del reproductor
  INSERT INTO public.player_states (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil al registrarse
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para limitar historial a las últimas 100 canciones
CREATE OR REPLACE FUNCTION public.trim_listening_history()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.listening_history
  WHERE user_id = NEW.user_id
  AND id NOT IN (
    SELECT id FROM public.listening_history
    WHERE user_id = NEW.user_id
    ORDER BY played_at DESC
    LIMIT 100
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trim_history_trigger ON public.listening_history;
CREATE TRIGGER trim_history_trigger
  AFTER INSERT ON public.listening_history
  FOR EACH ROW EXECUTE FUNCTION public.trim_listening_history();

-- ============================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- ============================================

CREATE INDEX idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX idx_playlist_tracks_playlist_id ON public.playlist_tracks(playlist_id);
CREATE INDEX idx_user_likes_user_id ON public.user_likes(user_id);
CREATE INDEX idx_listening_history_user_id ON public.listening_history(user_id);
CREATE INDEX idx_listening_history_played_at ON public.listening_history(played_at DESC);
