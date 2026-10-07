import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, Shuffle, Heart, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { getArtistById, getTracksByArtist, getAlbumsByArtist, artists } from '../lib/mockData';
import { formatNumber } from '../lib/utils';

export function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const artist = getArtistById(id || '');
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { toggleLike, isLiked } = useLibraryStore();

  if (!artist) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/50">Artist not found</p>
      </div>
    );
  }

  const artistTracks = getTracksByArtist(artist.id);
  const artistAlbums = getAlbumsByArtist(artist.id);
  const relatedArtists = artists.filter(a => a.id !== artist.id).slice(0, 4);
  const topTracks = artistTracks.slice(0, 5);
  const isCurrentArtist = artistTracks.some(t => t.id === currentTrack?.id);

  const handlePlayAll = () => {
    if (isCurrentArtist && isPlaying) {
      togglePlay();
    } else if (artistTracks.length > 0) {
      playTrack(artistTracks[0], artistTracks);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Hero */}
      <div className="relative -mx-4 md:-mx-6 -mt-4 md:-mt-6 px-4 md:px-6 pt-16 pb-8 mb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/20 to-transparent" />
        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6">
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={artist.image}
            alt={artist.name}
            className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover shadow-2xl"
          />
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
              {artist.verified && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
              <span className="text-sm text-white/60">Verified Artist</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2">{artist.name}</h1>
            <p className="text-white/60">{formatNumber(artist.monthlyListeners)} monthly listeners</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handlePlayAll}
          className="w-14 h-14 rounded-full gradient-accent flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
        >
          {isCurrentArtist && isPlaying ? (
            <Pause className="w-6 h-6 text-white fill-white" />
          ) : (
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          )}
        </button>
        <button className="px-6 py-2 rounded-full border border-white/20 text-sm font-medium hover:border-white/40 transition-colors">
          Follow
        </button>
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white">
          <Shuffle className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Popular Tracks */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Popular</h2>
        <div className="space-y-1">
          {topTracks.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => playTrack(track, artistTracks)}
              className="flex items-center gap-4 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
            >
              <span className="w-6 text-center text-sm text-white/40 group-hover:hidden">{i + 1}</span>
              <Play className="w-4 h-4 text-white hidden group-hover:block" />
              <img src={track.cover} alt={track.title} className="w-10 h-10 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${currentTrack?.id === track.id ? 'text-violet-400' : ''}`}>
                  {track.title}
                </p>
                <p className="text-xs text-white/50">{formatNumber(track.playCount)} plays</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Heart
                  className={`w-4 h-4 ${isLiked(track.id) ? 'text-violet-400 fill-violet-400' : 'text-white/40'}`}
                />
              </button>
              <span className="text-sm text-white/40">
                {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Discography */}
      {artistAlbums.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Discography</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artistAlbums.map(album => (
              <motion.div key={album.id} whileHover={{ y: -4 }} className="group cursor-pointer">
                <div className="relative mb-3">
                  <img src={album.cover} alt={album.title} className="w-full aspect-square rounded-xl object-cover shadow-lg" />
                  <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
                <p className="text-sm font-medium truncate">{album.title}</p>
                <p className="text-xs text-white/50">{album.year} • {album.type}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Related Artists */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Related Artists</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {relatedArtists.map(a => (
            <Link key={a.id} to={`/artist/${a.id}`} className="group">
              <motion.div whileHover={{ y: -4 }} className="relative mb-3">
                <img src={a.image} alt={a.name} className="w-full aspect-square rounded-full object-cover shadow-lg" />
                <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
              </motion.div>
              <p className="text-sm font-medium text-center truncate">{a.name}</p>
              <p className="text-xs text-white/50 text-center">Artist</p>
            </Link>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
