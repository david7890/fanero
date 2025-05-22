# Configuración de Google OAuth para tu aplicación Fanero

Para habilitar el inicio de sesión con Google en tu aplicación, sigue estos pasos:

## 1. Crear un proyecto en Google Cloud Platform

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. En el menú de navegación, ve a "APIs y servicios" > "Pantalla de consentimiento de OAuth"
4. Configura la pantalla de consentimiento:
   - Selecciona "Externo" si es para uso público
   - Completa la información requerida (nombre de la aplicación, correo de soporte, etc.)
   - En los ámbitos, añade: `.../auth/userinfo.email`, `.../auth/userinfo.profile` y `openid`

## 2. Crear credenciales de OAuth

1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "ID de cliente de OAuth"
3. Selecciona "Aplicación web" como tipo
4. Dale un nombre a tu aplicación
5. En "Orígenes autorizados de JavaScript", añade:
   - `http://localhost:3000` (para desarrollo)
   - Tu dominio de producción cuando lo tengas
6. En "URIs de redirección autorizados", añade:
   - `http://localhost:3000/api/auth/callback/google` (para desarrollo)
   - `https://tu-dominio.com/api/auth/callback/google` (para producción)
7. Haz clic en "Crear"
8. Anota el "ID de cliente" y el "Secreto del cliente" generados

## 3. Añadir las variables de entorno a tu proyecto

Crea un archivo `.env` en la raíz de tu proyecto con el siguiente contenido:

```
# URL base de tu aplicación
NEXTAUTH_URL=http://localhost:3000

# Secret para NextAuth (genera uno seguro con: openssl rand -base64 32)
NEXTAUTH_SECRET=tu_secreto_seguro_aqui

# Credenciales de Google OAuth
GOOGLE_CLIENT_ID=tu_client_id_de_google
GOOGLE_CLIENT_SECRET=tu_client_secret_de_google

# Conexión a base de datos Supabase (usa tus credenciales actuales)
DATABASE_URL="postgresql://postgres:tu_contraseña@db.tuproyecto.supabase.co:5432/postgres"
```

Reemplaza los valores marcados con `tu_*` con tus propias credenciales.

## 4. Reiniciar tu aplicación

Una vez añadidas las variables de entorno, reinicia tu aplicación Next.js para que los cambios tengan efecto.

## Problemas comunes

- **Error 400: redirect_uri_mismatch**: Asegúrate de que la URL de redirección en la configuración de Google coincida exactamente con la URL de tu aplicación + `/api/auth/callback/google`
- **Error de cliente o secreto inválido**: Verifica que hayas copiado correctamente los valores de las credenciales
- **Error de ámbitos**: Verifica que hayas solicitado los ámbitos necesarios en la pantalla de consentimiento 