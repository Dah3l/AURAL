# 🔍 Debug: Problema con agregar canciones a playlist

## Problema reportado
Cuando agregas una canción a una playlist existente, la canción "reemplaza" la única canción que ya existe en lugar de añadirse.

## Logs agregados
Se agregaron logs detallados en:
- `addTrackToPlaylist` - Muestra el proceso completo de agregar una canción
- `getPlaylistTracks` - Muestra cuántos tracks se están obteniendo de la playlist

## Cómo debuggear

### 1. Abrir la consola del navegador
- Chrome/Edge: F12 → pestaña "Console"
- Firefox: F12 → pestaña "Console"

### 2. Probar el flujo completo
1. Ve a una playlist que ya tenga al menos 1 canción
2. Reproduce una canción diferente
3. Abre la vista expandida del reproductor
4. Presiona el botón "+" (Añadir a playlist)
5. Selecciona la playlist existente
6. Observa los logs en la consola

### 3. Qué buscar en los logs

#### Logs de `addTrackToPlaylist`:
```
[addTrackToPlaylist] Iniciando... {playlistId: "...", trackId: "..."}
[addTrackToPlaylist] Nueva posición: 1
[addTrackToPlaylist] Canción añadida exitosamente: [...]
```

Si ves esto, la canción se agregó correctamente.

#### Logs de `getPlaylistTracks`:
```
[getPlaylistTracks] Obteniendo tracks para playlist: ...
[getPlaylistTracks] Tracks encontrados: 2 [{track_id: "...", position: 0}, {track_id: "...", position: 1}]
```

Si ves `Tracks encontrados: 1` cuando debería haber 2, el problema está en la base de datos.

## Posibles causas

### 1. PRIMARY KEY constraint
La tabla `playlist_tracks` tiene PRIMARY KEY en `(playlist_id, track_id)`, lo que impide duplicados. Si intentas agregar la misma canción dos veces, fallará.

**Solución:** Ya se agregó una verificación que muestra el error "Esta canción ya está en la playlist".

### 2. Row Level Security (RLS)
Las políticas de RLS podrían estar bloqueando la inserción o lectura de tracks.

**Verificar:** En Supabase → Authentication → Policies → playlist_tracks

Deberías tener:
- SELECT: Usuarios pueden ver tracks de sus playlists
- INSERT: Usuarios pueden insertar tracks en sus playlists

### 3. Problema con la consulta
La consulta `getPlaylistTracks` podría estar devolviendo solo un track por algún motivo.

**Verificar:** Revisa los logs de `getPlaylistTracks` para ver cuántos tracks se están obteniendo.

### 4. Problema con la UI
La página de playlist podría estar mostrando solo un track aunque haya más en la base de datos.

**Verificar:** Revisa los logs de `getPlaylistTracks` para confirmar cuántos tracks hay realmente.

## Próximos pasos

1. **Ejecuta el flujo completo** con la consola abierta
2. **Copia los logs** que aparecen
3. **Comparte los logs** para identificar el problema exacto

## Comandos útiles de Supabase

Para verificar directamente en la base de datos:

```sql
-- Ver todos los tracks de una playlist
SELECT * FROM playlist_tracks WHERE playlist_id = 'TU_PLAYLIST_ID';

-- Contar tracks de una playlist
SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = 'TU_PLAYLIST_ID';

-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'playlist_tracks';
```

## Contacto
Si el problema persiste después de revisar los logs, comparte:
1. Los logs de la consola
2. El ID de la playlist problemática
3. Los IDs de las canciones que intentaste agregar
