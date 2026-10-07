# Integración API Jamendo - Aural

## Configuración

El proyecto está configurado para usar la API de Jamendo con las siguientes variables de entorno:

```env
VITE_JAMENDO_CLIENT_ID=719ac338
VITE_USE_PROXY=true
```

### Proxy CORS

Cuando `VITE_USE_PROXY=true`, las peticiones a Jamendo se enrutan a través de `https://corsproxy.io/` para evitar problemas de CORS en el navegador.

Si necesitas desactivar el proxy (por ejemplo, en un entorno de producción con backend propio), establece `VITE_USE_PROXY=false`.

## Arquitectura de Integración

### Archivos Creados

1. **`src/lib/jamendo.ts`** - Cliente API de Jamendo
   - `getPopularTracks()` - Tracks populares
   - `searchTracks(query)` - Búsqueda en tiempo real
   - `getTracksByTag(tag)` - Tracks por género/tag
   - `getPopularArtists()` - Artistas populares
   - `getPopularAlbums()` - Álbumes populares
   - `getTracksByArtist(artistId)` - Tracks de un artista
   - `getAlbumTracks(albumId)` - Tracks de un álbum

2. **`src/lib/adapters.ts`** - Adaptadores de datos
   - Convierte datos de Jamendo al formato interno de Aural
   - `jamendoTrackToTrack()` - Track individual
   - `jamendoArtistToArtist()` - Artista individual
   - `jamendoAlbumToAlbum()` - Álbum individual
   - Versiones en plural para arrays

3. **`src/types/jamendo.ts`** - Tipos TypeScript
   - `JamendoTrack` - Estructura de track de Jamendo
   - `JamendoArtist` - Estructura de artista de Jamendo
   - `JamendoAlbum` - Estructura de álbum de Jamendo
   - `JamendoResponse<T>` - Respuesta genérica de la API

### Páginas Modificadas

1. **`src/pages/Home.tsx`**
   - Carga tracks populares de Jamendo al iniciar
   - Carga artistas populares
   - Muestra skeletons durante la carga
   - Maneja errores con toasts

2. **`src/pages/Search.tsx`**
   - Búsqueda en tiempo real con debounce de 300ms
   - Busca tracks y artistas simultáneamente
   - Estados: loading, empty, results
   - Microcopy de marca en estados vacíos

3. **`src/pages/Artist.tsx`**
   - Carga tracks del artista desde Jamendo
   - Extrae ID real de Jamendo del formato interno (`jamendo-artist-{id}`)
   - Muestra artistas relacionados
   - Maneja estados de carga y error

4. **`src/pages/Playlist.tsx`**
   - Mapea playlists mock a tags de Jamendo
   - Carga tracks basados en el género/tag de la playlist
   - Mantiene la estructura visual existente

## Flujo de Datos

```
Usuario → Página → jamendo.ts → API Jamendo → adaptadores.ts → Componentes UI
                                                              ↓
                                                         Store (Zustand)
                                                              ↓
                                                         Player (audio)
```

### Ejemplo: Reproducir una canción

1. Usuario hace clic en un track en Home
2. Se llama a `playTrack(track, queue)` del store
3. El track tiene `audioUrl` mapeado desde `jTrack.audio` de Jamendo
4. El componente Player usa `audio.src = currentTrack.audioUrl`
5. El navegador reproduce el MP3 directamente desde Jamendo

## Manejo de Estados

### Loading
- Skeletons animados con `animate-pulse` de Tailwind
- Mantienen la estructura visual de la página

### Error
- Toasts con microcopy de marca: "Algo se desafinó. Intenta de nuevo."
- Console.error para debugging

### Empty
- Estados vacíos con logo de Aural
- Microcopy: "No encontramos eso. Prueba con otra cosa."

## Persistencia

- **Favoritos**: Se guardan en localStorage (store `libraryStore`)
- **Playlists**: Se guardan en localStorage (store `libraryStore`)
- **Recientes**: Se guardan en localStorage (store `libraryStore`)
- **IDs**: Usan prefijo `jamendo-` para distinguir de datos mock

## Notas Técnicas

1. **Audio**: Los tracks se reproducen directamente desde la URL de Jamendo (`jTrack.audio`)
2. **Covers**: Se usa `jTrack.image` o `jTrack.album_image` como fallback
3. **IDs**: Se prefijan con `jamendo-` para evitar colisiones con datos mock
4. **CORS**: El proxy `corsproxy.io` maneja las restricciones de CORS
5. **Rate Limiting**: Jamendo tiene límites de peticiones, el debounce de 300ms ayuda

## Endpoints Usados

- `GET /tracks/` - Con parámetros: `order`, `search`, `tags`, `artist_id`, `album_id`
- `GET /artists/` - Con parámetro: `order`
- `GET /albums/` - Con parámetro: `order`

Todos los endpoints incluyen:
- `client_id=719ac338`
- `format=json`
- `include=musicinfo` (para tracks)
- `audioformat=mp32` (para tracks)

## Testing

Para probar la integración:

1. **Home**: Debería cargar tracks populares al iniciar
2. **Search**: Buscar "rock" debería mostrar resultados en < 1s
3. **Artist**: Hacer clic en un artista debería cargar sus tracks
4. **Playlist**: Las playlists deberían mostrar tracks del género correspondiente
5. **Player**: Las canciones deberían reproducirse sin problemas de CORS

## Sistema de Fallback Automático

La aplicación incluye un sistema de fallback robusto que garantiza que siempre haya contenido disponible:

### Cómo funciona

1. **Detección de errores**: Si la API de Jamendo devuelve error 401/403, se marca como no disponible
2. **Fallback automático**: Las páginas usan datos mock locales cuando la API falla
3. **Sin interrupciones**: El usuario siempre ve contenido, sin errores visibles

### Implementación

- `src/lib/useAuralData.ts` - Hooks con fallback integrado
- `isJamendoApiAvailable()` - Verifica si la API está disponible
- Si la API falla, se usan datos de `src/lib/mockData.ts`

### Ventajas

✅ La app siempre funciona, con o sin API
✅ No muestra errores al usuario
✅ Transición transparente entre API y fallback
✅ Los datos mock incluyen audio funcional (SoundHelix)

## Troubleshooting

### Error 401 Unauthorized
- El `client_id` puede no ser válido o haber expirado
- La app automáticamente usa datos mock como fallback
- No afecta la experiencia del usuario

### Error de CORS
- Verifica que `VITE_USE_PROXY=true` en `.env`
- Si el proxy falla, la app usa fallback automáticamente
- Alternativa: `https://api.allorigins.win/raw?url=`

### Tracks no se reproducen
- Con Jamendo: verifica que `jTrack.audio` no sea null
- Con fallback: los tracks usan SoundHelix (siempre funcionan)
- Revisa la consola del navegador para errores de red

### Búsqueda lenta
- El debounce de 300ms debería ayudar
- Si la API falla, la búsqueda filtra datos mock localmente
- La búsqueda local es instantánea

## Futuras Mejoras

- [ ] Cachear resultados de búsqueda en localStorage
- [ ] Implementar infinite scroll para más resultados
- [ ] Agregar filtros avanzados (duración, género, año)
- [ ] Crear playlists reales en Jamendo (requiere autenticación OAuth)
- [ ] Sincronizar favoritos con cuenta de Jamendo
- [ ] Agregar letras de canciones (si la API las provee)
