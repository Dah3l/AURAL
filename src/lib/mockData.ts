import { Track, Album, Artist, Playlist, Genre } from '../types';

const COVERS = [
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=300&h=300&fit=crop',
];

const ARTIST_IMAGES = [
  'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1549213783-8284d0336c4f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c35185b8ac?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
];

export const artists: Artist[] = [
  { id: 'a1', name: 'Luna Vega', image: ARTIST_IMAGES[0], genre: 'Electronic', monthlyListeners: 4523100, verified: true, albums: ['al1', 'al2'] },
  { id: 'a2', name: 'The Midnight', image: ARTIST_IMAGES[1], genre: 'Synthwave', monthlyListeners: 3210000, verified: true, albums: ['al3'] },
  { id: 'a3', name: 'Aurora Skies', image: ARTIST_IMAGES[2], genre: 'Dream Pop', monthlyListeners: 2890000, verified: true, albums: ['al4'] },
  { id: 'a4', name: 'Kai Rivers', image: ARTIST_IMAGES[3], genre: 'Indie Rock', monthlyListeners: 1950000, verified: false, albums: ['al5'] },
  { id: 'a5', name: 'Nova Eclipse', image: ARTIST_IMAGES[4], genre: 'Ambient', monthlyListeners: 1420000, verified: true, albums: ['al6'] },
  { id: 'a6', name: 'Sage Morrison', image: ARTIST_IMAGES[5], genre: 'R&B', monthlyListeners: 5670000, verified: true, albums: ['al7'] },
  { id: 'a7', name: 'Echo Chamber', image: ARTIST_IMAGES[6], genre: 'Alternative', monthlyListeners: 890000, verified: false, albums: ['al8'] },
  { id: 'a8', name: 'Zara Phoenix', image: ARTIST_IMAGES[7], genre: 'Pop', monthlyListeners: 7230000, verified: true, albums: ['al1', 'al4'] },
  { id: 'a9', name: 'Drift Collective', image: ARTIST_IMAGES[8], genre: 'Lo-fi', monthlyListeners: 2100000, verified: false, albums: ['al5'] },
  { id: 'a10', name: 'Atlas Sound', image: ARTIST_IMAGES[9], genre: 'Post-Rock', monthlyListeners: 1670000, verified: true, albums: ['al6', 'al8'] },
];

export const tracks: Track[] = [
  { id: 't1', title: 'Neon Dreams', artist: 'Luna Vega', artistId: 'a1', album: 'Midnight City', albumId: 'al1', duration: 234, cover: COVERS[0], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', liked: true, playCount: 4523100 },
  { id: 't2', title: 'Electric Pulse', artist: 'Luna Vega', artistId: 'a1', album: 'Midnight City', albumId: 'al1', duration: 198, cover: COVERS[0], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', liked: false, playCount: 3210000 },
  { id: 't3', title: 'Sunset Boulevard', artist: 'The Midnight', artistId: 'a2', album: 'Endless Summer', albumId: 'al3', duration: 267, cover: COVERS[1], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', liked: true, playCount: 2890000 },
  { id: 't4', title: 'Retrograde', artist: 'The Midnight', artistId: 'a2', album: 'Endless Summer', albumId: 'al3', duration: 312, cover: COVERS[1], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', liked: false, playCount: 1950000 },
  { id: 't5', title: 'Crystal Waters', artist: 'Aurora Skies', artistId: 'a3', album: 'Ethereal', albumId: 'al4', duration: 245, cover: COVERS[2], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', liked: true, playCount: 5670000 },
  { id: 't6', title: 'Floating', artist: 'Aurora Skies', artistId: 'a3', album: 'Ethereal', albumId: 'al4', duration: 189, cover: COVERS[2], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', liked: false, playCount: 1420000 },
  { id: 't7', title: 'Wild Hearts', artist: 'Kai Rivers', artistId: 'a4', album: 'Uncharted', albumId: 'al5', duration: 278, cover: COVERS[3], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', liked: true, playCount: 890000 },
  { id: 't8', title: 'Mountain Echo', artist: 'Kai Rivers', artistId: 'a4', album: 'Uncharted', albumId: 'al5', duration: 301, cover: COVERS[3], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', liked: false, playCount: 760000 },
  { id: 't9', title: 'Deep Space', artist: 'Nova Eclipse', artistId: 'a5', album: 'Cosmos', albumId: 'al6', duration: 356, cover: COVERS[4], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', liked: true, playCount: 2100000 },
  { id: 't10', title: 'Stardust', artist: 'Nova Eclipse', artistId: 'a5', album: 'Cosmos', albumId: 'al6', duration: 289, cover: COVERS[4], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', liked: false, playCount: 1670000 },
  { id: 't11', title: 'Velvet Touch', artist: 'Sage Morrison', artistId: 'a6', album: 'Golden Hour', albumId: 'al7', duration: 223, cover: COVERS[5], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', liked: true, playCount: 7230000 },
  { id: 't12', title: 'After Dark', artist: 'Sage Morrison', artistId: 'a6', album: 'Golden Hour', albumId: 'al7', duration: 245, cover: COVERS[5], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', liked: false, playCount: 4560000 },
  { id: 't13', title: 'Broken Glass', artist: 'Echo Chamber', artistId: 'a7', album: 'Fragments', albumId: 'al8', duration: 267, cover: COVERS[6], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', liked: true, playCount: 1230000 },
  { id: 't14', title: 'Shadows', artist: 'Echo Chamber', artistId: 'a7', album: 'Fragments', albumId: 'al8', duration: 234, cover: COVERS[6], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', liked: false, playCount: 980000 },
  { id: 't15', title: 'Phoenix Rising', artist: 'Zara Phoenix', artistId: 'a8', album: 'Midnight City', albumId: 'al1', duration: 198, cover: COVERS[7], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', liked: true, playCount: 8900000 },
  { id: 't16', title: 'Starlight', artist: 'Zara Phoenix', artistId: 'a8', album: 'Ethereal', albumId: 'al4', duration: 212, cover: COVERS[7], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', liked: false, playCount: 6780000 },
  { id: 't17', title: 'Rainy Days', artist: 'Drift Collective', artistId: 'a9', album: 'Uncharted', albumId: 'al5', duration: 345, cover: COVERS[8], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', liked: true, playCount: 3450000 },
  { id: 't18', title: 'Coffee & Code', artist: 'Drift Collective', artistId: 'a9', album: 'Uncharted', albumId: 'al5', duration: 278, cover: COVERS[8], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', liked: false, playCount: 2340000 },
  { id: 't19', title: 'Infinite Loop', artist: 'Atlas Sound', artistId: 'a10', album: 'Cosmos', albumId: 'al6', duration: 412, cover: COVERS[9], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', liked: true, playCount: 1890000 },
  { id: 't20', title: 'Tidal Wave', artist: 'Atlas Sound', artistId: 'a10', album: 'Fragments', albumId: 'al8', duration: 367, cover: COVERS[9], audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', liked: false, playCount: 1560000 },
];

export const albums: Album[] = [
  { id: 'al1', title: 'Midnight City', artist: 'Luna Vega', artistId: 'a1', cover: COVERS[0], year: 2024, tracks: ['t1', 't2', 't15'], type: 'album' },
  { id: 'al2', title: 'Digital Horizon', artist: 'Luna Vega', artistId: 'a1', cover: COVERS[10], year: 2023, tracks: ['t1', 't2'], type: 'ep' },
  { id: 'al3', title: 'Endless Summer', artist: 'The Midnight', artistId: 'a2', cover: COVERS[1], year: 2024, tracks: ['t3', 't4'], type: 'album' },
  { id: 'al4', title: 'Ethereal', artist: 'Aurora Skies', artistId: 'a3', cover: COVERS[2], year: 2024, tracks: ['t5', 't6', 't16'], type: 'album' },
  { id: 'al5', title: 'Uncharted', artist: 'Kai Rivers', artistId: 'a4', cover: COVERS[3], year: 2023, tracks: ['t7', 't8', 't17', 't18'], type: 'album' },
  { id: 'al6', title: 'Cosmos', artist: 'Nova Eclipse', artistId: 'a5', cover: COVERS[4], year: 2024, tracks: ['t9', 't10', 't19'], type: 'album' },
  { id: 'al7', title: 'Golden Hour', artist: 'Sage Morrison', artistId: 'a6', cover: COVERS[5], year: 2024, tracks: ['t11', 't12'], type: 'album' },
  { id: 'al8', title: 'Fragments', artist: 'Echo Chamber', artistId: 'a7', cover: COVERS[6], year: 2023, tracks: ['t13', 't14', 't20'], type: 'album' },
];

export const playlists: Playlist[] = [
  { id: 'p1', title: 'Vibras Tranquilas', description: 'Perfecto para relajarte y desconectar', cover: COVERS[0], owner: 'Aural', tracks: ['t5', 't6', 't9', 't17', 't18'], duration: 1613, isPublic: true, createdAt: '2024-01-15' },
  { id: 'p2', title: 'Manejo Nocturno', description: 'Synthwave y electrónica para viajes nocturnos', cover: COVERS[1], owner: 'Aural', tracks: ['t1', 't2', 't3', 't4', 't15'], duration: 1209, isPublic: true, createdAt: '2024-02-20' },
  { id: 'p3', title: 'Descubrimientos Indie', description: 'Tracks indie frescos que necesitas escuchar', cover: COVERS[3], owner: 'Aural', tracks: ['t7', 't8', 't13', 't14', 't19', 't20'], duration: 1859, isPublic: true, createdAt: '2024-03-10' },
  { id: 'p4', title: 'Flujo de Concentración', description: 'Ambient y lo-fi para trabajo profundo', cover: COVERS[4], owner: 'Aural', tracks: ['t9', 't10', 't17', 't18', 't19'], duration: 1790, isPublic: true, createdAt: '2024-01-28' },
  { id: 'p5', title: 'Energía de Fin de Semana', description: 'Tracks de alta energía para el fin de semana', cover: COVERS[7], owner: 'Aural', tracks: ['t11', 't12', 't15', 't16', 't1'], duration: 1075, isPublic: true, createdAt: '2024-04-05' },
  { id: 'p6', title: 'Mañanas Acústicas', description: 'Comienza tu día con sonidos suaves', cover: COVERS[8], owner: 'Aural', tracks: ['t5', 't6', 't7', 't8', 't17'], duration: 1557, isPublic: true, createdAt: '2024-02-14' },
];

export const genres: Genre[] = [
  { id: 'g1', name: 'Electronic', color: '#8B5CF6', image: COVERS[0] },
  { id: 'g2', name: 'Synthwave', color: '#EC4899', image: COVERS[1] },
  { id: 'g3', name: 'Dream Pop', color: '#06B6D4', image: COVERS[2] },
  { id: 'g4', name: 'Indie Rock', color: '#F59E0B', image: COVERS[3] },
  { id: 'g5', name: 'Ambient', color: '#10B981', image: COVERS[4] },
  { id: 'g6', name: 'R&B', color: '#EF4444', image: COVERS[5] },
  { id: 'g7', name: 'Alternative', color: '#6366F1', image: COVERS[6] },
  { id: 'g8', name: 'Pop', color: '#F97316', image: COVERS[7] },
  { id: 'g9', name: 'Lo-fi', color: '#14B8A6', image: COVERS[8] },
  { id: 'g10', name: 'Post-Rock', color: '#A855F7', image: COVERS[9] },
  { id: 'g11', name: 'Hip Hop', color: '#DC2626', image: COVERS[10] },
  { id: 'g12', name: 'Jazz', color: '#D97706', image: COVERS[11] },
];

export const getTrackById = (id: string): Track | undefined => tracks.find(t => t.id === id);
export const getAlbumById = (id: string): Album | undefined => albums.find(a => a.id === id);
export const getArtistById = (id: string): Artist | undefined => artists.find(a => a.id === id);
export const getPlaylistById = (id: string): Playlist | undefined => playlists.find(p => p.id === id);
export const getTracksByArtist = (artistId: string): Track[] => tracks.filter(t => t.artistId === artistId);
export const getTracksByAlbum = (albumId: string): Track[] => tracks.filter(t => t.albumId === albumId);
export const getAlbumsByArtist = (artistId: string): Album[] => albums.filter(a => a.artistId === artistId);
