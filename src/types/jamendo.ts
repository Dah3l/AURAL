// Tipos para la API de Jamendo

export interface JamendoTrack {
  id: string;
  name: string;
  duration: number;
  artist_name: string;
  artist_id: string;
  artist_idstr?: string;
  artist_image?: string;
  album_name?: string;
  album_id?: string;
  album_image?: string;
  image?: string;
  audio: string;
  audiodownload?: string;
  audiodownload_allowed?: boolean;
  releasedate?: string;
  license_ccurl?: string;
  shareurl?: string;
  shorturl?: string;
  musicinfo?: {
    vocalinstrumental?: string;
    lang?: string;
    gender?: string;
    acousticelectric?: string;
    speed?: string;
    tags?: {
      genres?: string[];
      instruments?: string[];
      vartags?: string[];
    };
  };
}

export interface JamendoArtist {
  id: string;
  name: string;
  image?: string;
  joindate?: string;
  shareurl?: string;
  shorturl?: string;
  website?: string;
}

export interface JamendoAlbum {
  id: string;
  name: string;
  image?: string;
  artist_name: string;
  artist_id: string;
  releasedate?: string;
  shareurl?: string;
  shorturl?: string;
  zip?: string;
}

export interface JamendoResponse<T> {
  headers: {
    status: string;
    code: number;
    error_message: string;
    warnings: string;
    results_count?: number;
  };
  results: T[];
}
