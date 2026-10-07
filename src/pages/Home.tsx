import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { tracks, albums, playlists, artists, getTrackById } from '../lib/mockData';
import { getGreeting } from '../lib/utils';
import { Link } from 'react-router-dom';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
};

export function Home() {
  const { playTrack } = usePlayerStore();
  const recentlyPlayed = useLibraryStore(s => s.recentlyPlayed);

  const recentTracks = recentlyPlayed
    .map(id => getTrackById(id))
    .filter(Boolean)
    .slice(0, 6);

  const dailyMix = tracks.slice(0, 6);
  const discoveries = tracks.slice(6, 12);
  const topArtists = artists.slice(0, 6);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="pb-8">
      {/* Saludo */}
      <motion.div variants={item} className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.15em] text-[#8B8B96] font-medium mb-2">
          {getGreeting()}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#F5F5F7]">
          Solo música. <span className="gradient-text">Solo tú.</span>
        </h1>
      </motion.div>

      {/* Escuchado recientemente */}
      {recentTracks.length > 0 && (
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-10">
          {recentTracks.map(track => (
            track && (
              <motion.button
                key={track.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => playTrack(track, tracks)}
                className="flex items-center gap-3 bg-[#131318] hover:bg-[#1E1E26] border border-[#2A2A35] hover:border-[#7C3AED]/30 rounded-xl overflow-hidden transition-all duration-200 group"
              >
                <img src={track.cover} alt={track.title} className="w-12 h-12 md:w-16 md:h-16 object-cover" />
                <span className="text-sm font-medium truncate pr-2 text-[#F5F5F7]">{track.title}</span>
                <div className="ml-auto mr-3 w-9 h-9 rounded-full gradient-aura-glow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4 text-white fill-white ml-0.5" strokeWidth={1.75} />
                </div>
              </motion.button>
            )
          ))}
        </motion.div>
      )}

      {/* Hecho para ti — Daily Mix */}
      <motion.section variants={item} className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-[#F5F5F7]">Hecho para ti</h2>
          <button className="text-xs text-[#8B8B96] hover:text-[#F5F5F7] transition-colors uppercase tracking-wider font-medium">Ver todo</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {dailyMix.map(track => (
            <motion.div
              key={track.id}
              whileHover={{ y: -4 }}
              className="group cursor-pointer"
              onClick={() => playTrack(track, dailyMix)}
            >
              <div className="relative mb-3">
                <img src={track.cover} alt={track.title} className="w-full aspect-square rounded-xl object-cover shadow-lg ring-1 ring-[#2A2A35]" />
                <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full gradient-aura-glow flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-sm font-medium truncate text-[#F5F5F7]">{track.title}</p>
              <p className="text-xs text-[#8B8B96] truncate">{track.artist}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Playlists curadas */}
      <motion.section variants={item} className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-[#F5F5F7]">Playlists de Aural</h2>
          <button className="text-xs text-[#8B8B96] hover:text-[#F5F5F7] transition-colors uppercase tracking-wider font-medium">Ver todo</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {playlists.slice(0, 6).map(playlist => (
            <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="group">
              <motion.div whileHover={{ y: -4 }} className="relative mb-3">
                <img src={playlist.cover} alt={playlist.title} className="w-full aspect-square rounded-xl object-cover shadow-lg ring-1 ring-[#2A2A35]" />
                <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full gradient-aura-glow flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" strokeWidth={1.75} />
                </div>
              </motion.div>
              <p className="text-sm font-medium truncate text-[#F5F5F7]">{playlist.title}</p>
              <p className="text-xs text-[#8B8B96] truncate">{playlist.description}</p>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Descubrimientos */}
      <motion.section variants={item} className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-[#F5F5F7]">Descubrimientos</h2>
          <button className="text-xs text-[#8B8B96] hover:text-[#F5F5F7] transition-colors uppercase tracking-wider font-medium">Ver todo</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {discoveries.map(track => (
            <motion.div
              key={track.id}
              whileHover={{ y: -4 }}
              className="group cursor-pointer"
              onClick={() => playTrack(track, discoveries)}
            >
              <div className="relative mb-3">
                <img src={track.cover} alt={track.title} className="w-full aspect-square rounded-xl object-cover shadow-lg ring-1 ring-[#2A2A35]" />
                <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full gradient-aura-glow flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-sm font-medium truncate text-[#F5F5F7]">{track.title}</p>
              <p className="text-xs text-[#8B8B96] truncate">{track.artist}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Artistas populares */}
      <motion.section variants={item} className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-[#F5F5F7]">Tus artistas</h2>
          <button className="text-xs text-[#8B8B96] hover:text-[#F5F5F7] transition-colors uppercase tracking-wider font-medium">Ver todo</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {topArtists.map(artist => (
            <Link key={artist.id} to={`/artist/${artist.id}`} className="group">
              <motion.div whileHover={{ y: -4 }} className="relative mb-3">
                <img src={artist.image} alt={artist.name} className="w-full aspect-square rounded-full object-cover shadow-lg ring-1 ring-[#2A2A35]" />
                <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full gradient-aura-glow flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" strokeWidth={1.75} />
                </div>
              </motion.div>
              <p className="text-sm font-medium text-center truncate text-[#F5F5F7]">{artist.name}</p>
              <p className="text-xs text-[#8B8B96] text-center">Artista</p>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Nuevos lanzamientos */}
      <motion.section variants={item} className="mb-8">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-[#F5F5F7]">Nuevos lanzamientos</h2>
          <button className="text-xs text-[#8B8B96] hover:text-[#F5F5F7] transition-colors uppercase tracking-wider font-medium">Ver todo</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {albums.slice(0, 6).map(album => (
            <motion.div key={album.id} whileHover={{ y: -4 }} className="group cursor-pointer">
              <div className="relative mb-3">
                <img src={album.cover} alt={album.title} className="w-full aspect-square rounded-xl object-cover shadow-lg ring-1 ring-[#2A2A35]" />
                <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full gradient-aura-glow flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-sm font-medium truncate text-[#F5F5F7]">{album.title}</p>
              <p className="text-xs text-[#8B8B96] truncate">{album.artist} · {album.year}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
