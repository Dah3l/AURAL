import { motion } from 'framer-motion';
import { Play, Clock } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { tracks, albums, playlists, artists, getTrackById } from '../lib/mockData';
import { getGreeting } from '../lib/utils';
import { Link } from 'react-router-dom';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
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
      {/* Greeting */}
      <motion.h1 variants={item} className="text-2xl md:text-3xl font-bold mb-6">
        {getGreeting()}
      </motion.h1>

      {/* Recently Played Grid */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-8">
        {recentTracks.map(track => (
          track && (
            <motion.button
              key={track.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => playTrack(track, tracks)}
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-lg overflow-hidden transition-colors group"
            >
              <img src={track.cover} alt={track.title} className="w-12 h-12 md:w-16 md:h-16 object-cover" />
              <span className="text-sm font-medium truncate pr-2">{track.title}</span>
              <div className="ml-auto mr-3 w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </div>
            </motion.button>
          )
        ))}
      </motion.div>

      {/* Daily Mix */}
      <motion.section variants={item} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Daily Mix</h2>
          <button className="text-sm text-white/50 hover:text-white transition-colors">Show all</button>
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
                <img src={track.cover} alt={track.title} className="w-full aspect-square rounded-xl object-cover shadow-lg" />
                <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
              </div>
              <p className="text-sm font-medium truncate">{track.title}</p>
              <p className="text-xs text-white/50 truncate">{track.artist}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Made For You */}
      <motion.section variants={item} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Made For You</h2>
          <button className="text-sm text-white/50 hover:text-white transition-colors">Show all</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {playlists.slice(0, 6).map(playlist => (
            <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="group">
              <motion.div whileHover={{ y: -4 }} className="relative mb-3">
                <img src={playlist.cover} alt={playlist.title} className="w-full aspect-square rounded-xl object-cover shadow-lg" />
                <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
              </motion.div>
              <p className="text-sm font-medium truncate">{playlist.title}</p>
              <p className="text-xs text-white/50 truncate">{playlist.description}</p>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Discoveries */}
      <motion.section variants={item} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Discover New Music</h2>
          <button className="text-sm text-white/50 hover:text-white transition-colors">Show all</button>
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
                <img src={track.cover} alt={track.title} className="w-full aspect-square rounded-xl object-cover shadow-lg" />
                <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
              </div>
              <p className="text-sm font-medium truncate">{track.title}</p>
              <p className="text-xs text-white/50 truncate">{track.artist}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Popular Artists */}
      <motion.section variants={item} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Popular Artists</h2>
          <button className="text-sm text-white/50 hover:text-white transition-colors">Show all</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {topArtists.map(artist => (
            <Link key={artist.id} to={`/artist/${artist.id}`} className="group">
              <motion.div whileHover={{ y: -4 }} className="relative mb-3">
                <img src={artist.image} alt={artist.name} className="w-full aspect-square rounded-full object-cover shadow-lg" />
                <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
              </motion.div>
              <p className="text-sm font-medium text-center truncate">{artist.name}</p>
              <p className="text-xs text-white/50 text-center">Artist</p>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* New Releases */}
      <motion.section variants={item} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">New Releases</h2>
          <button className="text-sm text-white/50 hover:text-white transition-colors">Show all</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {albums.slice(0, 6).map(album => (
            <motion.div key={album.id} whileHover={{ y: -4 }} className="group cursor-pointer">
              <div className="relative mb-3">
                <img src={album.cover} alt={album.title} className="w-full aspect-square rounded-xl object-cover shadow-lg" />
                <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
              </div>
              <p className="text-sm font-medium truncate">{album.title}</p>
              <p className="text-xs text-white/50 truncate">{album.artist} • {album.year}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
