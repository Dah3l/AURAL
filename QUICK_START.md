# 🚀 Configuración Rápida - Aural + Supabase

## ✅ Credenciales Configuradas

Tu archivo `.env` ya está configurado con:
- **URL**: https://yuumjuuahebsyxfhetyg.supabase.co
- **Anon Key**: Configurada ✓

## 📋 Próximos Pasos (5 minutos)

### 1️⃣ Ejecutar el SQL en Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard/project/yuumjuuahebsyxfhetyg

2. En el menú lateral, haz clic en **SQL Editor** (icono de terminal)

3. Haz clic en **New Query**

4. Copia TODO el contenido del archivo `SUPABASE_SCHEMA.sql` de este proyecto

5. Pégalo en el editor SQL

6. Haz clic en **Run** (botón verde abajo a la derecha) o presiona `Ctrl+Enter`

7. Deberías ver: ✅ "Success. No rows returned"

### 2️⃣ Configurar Autenticación

1. En el menú lateral, haz clic en **Authentication**

2. Ve a **Providers**

3. Asegúrate de que **Email** esté habilitado (debería estarlo por defecto)

4. Ve a **URL Configuration**

5. Configura:
   - **Site URL**: `http://localhost:5173`
   - **Redirect URLs**: `http://localhost:5173/**`

### 3️⃣ Probar la Aplicación

```bash
# Inicia el servidor de desarrollo
npm run dev
```

Abre tu navegador en: **http://localhost:5173**

### 4️⃣ Crear tu Primera Cuenta

1. Verás la página de login/registro

2. Haz clic en **"Regístrate"**

3. Completa el formulario:
   - Nombre de usuario: `tu_usuario`
   - Email: `tu@email.com`
   - Contraseña: mínimo 6 caracteres

4. Haz clic en **"Crear cuenta"**

5. ⚠️ **Importante**: Revisa tu email para confirmar la cuenta (Supabase envía un email de confirmación)

6. Después de confirmar, inicia sesión

### 5️⃣ Verificar que Todo Funciona

Una vez dentro, deberías poder:

- ✅ Ver tu perfil con tu nombre de usuario
- ✅ Crear playlists (botón "+" en Biblioteca)
- ✅ Dar like a canciones (corazón en el reproductor)
- ✅ Ver tu historial de reproducción
- ✅ Cerrar sesión

## 🎉 ¡Listo!

Tu aplicación Aural ahora tiene:
- 🔐 Autenticación completa
- 💾 Base de datos PostgreSQL
- 🎵 Playlists personales
- ❤️ Favoritos sincronizados
- 📊 Historial de reproducción
- 🔄 Sincronización en tiempo real

## 🐛 ¿Problemas?

### Error: "relation does not exist"
- No ejecutaste el SQL. Vuelve al paso 1.

### Error: "Invalid API key"
- Verifica que las credenciales en `.env` sean correctas
- Reinicia el servidor (`Ctrl+C` y luego `npm run dev`)

### No llega el email de confirmación
- Revisa la carpeta de spam
- En Supabase → Authentication → Providers → Email
- Desactiva "Confirm email" temporalmente para testing

### Error: "new row violates row-level security policy"
- Verifica que estás autenticado
- Las políticas RLS están configuradas correctamente en el SQL

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Dashboard de tu proyecto](https://supabase.com/dashboard/project/yuumjuuahebsyxfhetyg)
- [Guía completa](./SUPABASE_SETUP.md)

---

**¿Todo funciona?** ¡Felicidades! Tu aplicación Aural ahora tiene un backend completo y profesional. 🎵
