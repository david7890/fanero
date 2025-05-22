# Scripts de utilidad para Fanero

Este directorio contiene scripts útiles para el desarrollo y pruebas de Fanero.

## Scripts disponibles

### `test-cloudinary.js`

Prueba la integración con Cloudinary para subir archivos.

#### Requisitos

- Node.js
- Dependencias instaladas: `node-fetch@2`, `form-data`, `dotenv`
- Variables de entorno configuradas en `.env.local`:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

#### Uso

```bash
# Iniciar el servidor en otra terminal
npm run dev

# Ejecutar el script con un archivo específico
node scripts/test-cloudinary.js ruta/al/archivo.jpg
```

#### Ejemplos

```bash
# Probar con una imagen del directorio public/test
node scripts/test-cloudinary.js public/test/test-image.jpg

# Probar con un video
node scripts/test-cloudinary.js public/test/test-video.mp4
```

## Verificación manual

También puedes usar la interfaz gráfica para verificar la integración con Cloudinary:

1. Inicia el servidor: `npm run dev`
2. Abre en el navegador: http://localhost:3000/test/cloudinary
3. Sigue las instrucciones en la página para probar la conexión y subir archivos

## Resolución de problemas

Si encuentras errores, verifica:

1. Que el servidor esté en ejecución
2. Que las variables de entorno estén correctamente configuradas en `.env.local`
3. Que tengas una conexión a internet activa
4. Que tu cuenta de Cloudinary esté activa y con límites suficientes 