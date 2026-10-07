# 🎵 AURAL - Configuración de Supabase

## 📋 Requisitos Previos

1. Cuenta en [Supabase](https://supabase.com) (gratis)
2. Proyecto creado en Supabase
3. Credenciales del proyecto (URL y anon key)

## 🚀 Configuración Paso a Paso

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Click en "New Project"
4. Nombre del proyecto: `aural-music` (o el que prefieras)
5. Establece una contraseña segura para la base de datos
6. Selecciona la región más cercana a ti
7. Click en "Create new project"
8. Espera a que se inicialice (1-2 minutos)

### 2. Obtener Credenciales

1. En el dashboard de tu proyecto, ve a **Settings** → **API**
2. Copia estos valores:
   - **Project URL** (ejemplo: `https://abcdefghijk.supabase.co`)
   - **anon public key** (una cadena larga que empieza con `eyJ...`)

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Jamendo API Configuration
VITE_JAMENDO_CLIENT_ID=719ac338
VITE_USE_PROXY=true

# Supabase Configuration
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE**: Reemplaza los valores con tus credenciales reales de Supabase.

### 4. Crear Tablas en la Base de Datos

1. En el dashboard de Supabase, ve a **SQL Editor** (icono de terminal en el menú lateral)
2. Click en "New Query"
3. Copia todo el contenido del archivo `SUPABASE_SCHEMA.sql`
4. Pégalo en el editor SQL
5. Click en "Run" (o presiona Ctrl+Enter)
6. Deberías ver "Success. No rows returned"

Esto creará:
- ✅ Tabla `user_profiles` - Perfiles de usuario
- ✅ Tabla `playlists` - Playlists del usuario
- ✅ Tabla `playlist_tracks` - Canciones en playlists
- ✅ Tabla `user_likes` - Favoritos
- ✅ Tabla `listening_history` - Historial de reproducción
- ✅ Tabla `player_states` - Estado del reproductor
- ✅ Políticas de seguridad (RLS)
- ✅ Triggers automáticos
- ✅ Índices para mejor rendimiento

### 5. Configurar Autenticación

1. Ve a **Authentication** → **Providers**
2. Habilita **Email** (debería estar habilitado por defecto)
3. Opcional: Habilita **Google** u otros proveedores si quieres
4. En **Authentication** → **URL Configuration**:
   - Site URL: `http://localhost:5173` (para desarrollo)
   - Redirect URLs: `http://localhost:5173/**`

### 6. Verificar Instalación

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Abre `http://localhost:5173` en tu navegador

3. Deberías ver la página de login/registro

4. Crea una cuenta de prueba:
   - Email: `test@aural.com`
   - Password: `test123456`
   - Username: `testuser`

5. Si todo funciona correctamente:
   - Serás redirigido a la página principal
   - Verás tu nombre de usuario en el perfil
   - Podrás crear playlists
   - Podrás dar like a canciones

## 🔧 Estructura de la Base de Datos

### user_profiles
```sql
- id (UUID, PK) - Referencia a auth.users
- username (TEXT) - Nombre de usuario único
- avatar_url (TEXT) - URL del avatar
- created_at (TIMESTAMP) - Fecha de creación
```

### playlists
```sql
- id (UUID, PK)
- user_id (UUID, FK) - Dueño de la playlist
- title (TEXT) - Título
- description (TEXT) - Descripción
- cover_url (TEXT) - URL de la portada
- is_public (BOOLEAN) - Si es pública o privada
- created_at (TIMESTAMP)
```

### playlist_tracks
```sql
- playlist_id (UUID, FK)
- track_id (TEXT) - ID de Jamendo
- position (INTEGER) - Orden en la playlist
- added_at (TIMESTAMP)
```

### user_likes
```sql
- user_id (UUID, FK)
- track_id (TEXT) - ID de Jamendo
- liked_at (TIMESTAMP)
```

### listening_history
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- track_id (TEXT) - ID de Jamendo
- played_at (TIMESTAMP)
```

### player_states
```sql
- user_id (UUID, PK, FK)
- current_track_id (TEXT)
- queue (JSONB) - Cola de reproducción
- queue_index (INTEGER)
- volume (NUMERIC)
- is_muted (BOOLEAN)
- shuffle (BOOLEAN)
- repeat_mode (TEXT)
- updated_at (TIMESTAMP)
```

## 🔐 Seguridad (Row Level Security)

Todas las tablas tienen RLS habilitado con las siguientes políticas:

- **user_profiles**: Usuarios solo pueden ver/editar su propio perfil
- **playlists**: Usuarios ven sus playlists + playlists públicas
- **playlist_tracks**: Acceso basado en permisos de la playlist
- **user_likes**: Usuarios solo ven sus propios likes
- **listening_history**: Usuarios solo ven su propio historial
- **player_states**: Usuarios solo ven su propio estado

## 🧪 Testing

### Probar Autenticación
```javascript
// En la consola del navegador
import { supabase } from './src/lib/supabase';

// Login
await supabase.auth.signInWithPassword({
  email: 'test@aural.com',
  password: 'test123456'
});

// Logout
await supabase.auth.signOut();
```

### Probar Playlists
```javascript
// Crear playlist
await supabase.from('playlists').insert({
  user_id: 'TU-USER-ID',
  title: 'Mi Playlist',
  description: 'Prueba',
  is_public: false
});

// Obtener playlists
await supabase.from('playlists').select('*');
```

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
- Verifica que el archivo `.env` existe
- Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están configurados
- Reinicia el servidor de desarrollo después de cambiar `.env`

### Error: "relation does not exist"
- Ejecuta el SQL en `SUPABASE_SCHEMA.sql`
- Verifica que las tablas se crearon en **Table Editor**

### Error: "new row violates row-level security policy"
- Verifica que estás autenticado
- Verifica que el `user_id` coincide con tu ID de usuario
- Revisa las políticas RLS en **Authentication** → **Policies**

### No se guardan los datos
- Abre la consola del navegador (F12)
- Busca errores en la pestaña "Console"
- Verifica la pestaña "Network" para ver las peticiones a Supabase

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Autenticación](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## 🎯 Próximos Pasos

Una vez configurado Supabase, puedes:

1. ✅ Crear playlists personalizadas
2. ✅ Dar like a canciones
3. ✅ Ver historial de reproducción
4. ✅ Sincronizar estado del reproductor
5. ✅ Compartir playlists públicas
6. ✅ Seguir a otros usuarios (futuro)

---

**¿Necesitas ayuda?** Revisa la documentación de Supabase o abre un issue en el repositorio.
