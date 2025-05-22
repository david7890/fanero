/**
 * Script para probar la integración con Cloudinary
 * 
 * Uso:
 * node scripts/test-cloudinary.js
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');
require('dotenv').config({ path: '.env.local' });

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Función para imprimir mensajes formateados
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Verificar que las variables de entorno están configuradas
function checkEnvVars() {
  log('\n🔍 Verificando variables de entorno...', colors.cyan);
  
  const requiredVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    log(`❌ Faltan las siguientes variables de entorno: ${missingVars.join(', ')}`, colors.red);
    log('Por favor, configúralas en tu archivo .env.local', colors.yellow);
    return false;
  }
  
  log('✅ Variables de entorno configuradas correctamente', colors.green);
  log(`🔹 CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME}`, colors.blue);
  log(`🔹 CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY.substring(0, 5)}...`, colors.blue);
  log(`🔹 CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET.substring(0, 5)}...`, colors.blue);
  
  return true;
}

// Probar la conexión con Cloudinary
async function testConnection() {
  log('\n🌐 Probando conexión con Cloudinary...', colors.cyan);
  
  try {
    const server = process.env.SERVER_URL || 'http://localhost:3000';
    const response = await fetch(`${server}/api/test/cloudinary`);
    const data = await response.json();
    
    if (data.success) {
      log('✅ Conexión establecida correctamente', colors.green);
      return true;
    } else {
      log(`❌ Error de conexión: ${data.message || 'Error desconocido'}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Error al verificar la conexión: ${error.message}`, colors.red);
    log('Asegúrate de que el servidor esté en ejecución en http://localhost:3000', colors.yellow);
    return false;
  }
}

// Probar la subida de un archivo
async function testUpload(filePath) {
  log(`\n📤 Probando subida de archivo: ${path.basename(filePath)}...`, colors.cyan);
  
  try {
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      log(`❌ El archivo no existe: ${filePath}`, colors.red);
      return false;
    }
    
    // Leer el archivo
    const fileBuffer = fs.readFileSync(filePath);
    const fileStats = fs.statSync(filePath);
    const fileSize = (fileStats.size / 1024).toFixed(2);
    const fileType = path.extname(filePath).toLowerCase();
    
    log(`🔹 Nombre: ${path.basename(filePath)}`, colors.blue);
    log(`🔹 Tamaño: ${fileSize} KB`, colors.blue);
    log(`🔹 Tipo: ${fileType}`, colors.blue);
    
    // Crear FormData
    const formData = new FormData();
    formData.append('file', fileBuffer, { filename: path.basename(filePath) });
    
    // Enviar archivo
    const server = process.env.SERVER_URL || 'http://localhost:3000';
    const response = await fetch(`${server}/api/test/cloudinary`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (data.success) {
      log('✅ Archivo subido exitosamente', colors.green);
      log(`🔹 URL: ${data.cloudinary.url}`, colors.blue);
      log(`🔹 ID Público: ${data.cloudinary.publicId}`, colors.blue);
      log(`🔹 Formato: ${data.cloudinary.format}`, colors.blue);
      log(`🔹 Tipo de recurso: ${data.cloudinary.resourceType}`, colors.blue);
      return true;
    } else {
      log(`❌ Error al subir el archivo: ${data.message || 'Error desconocido'}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Error al subir el archivo: ${error.message}`, colors.red);
    return false;
  }
}

// Ejecutar las pruebas
async function runTests() {
  log('🚀 Iniciando pruebas de Cloudinary', colors.cyan);
  
  // Verificar variables de entorno
  if (!checkEnvVars()) {
    return;
  }
  
  // Probar conexión
  const connectionSuccess = await testConnection();
  if (!connectionSuccess) {
    log('⚠️ No se pudo establecer conexión con Cloudinary. Abortando pruebas.', colors.yellow);
    return;
  }
  
  // Definir archivos de prueba
  const testFiles = [
    // Reemplaza estas rutas con rutas reales a archivos de prueba
    // path.join(__dirname, '../public/test-image.jpg'),
    // path.join(__dirname, '../public/test-image.png'),
    // path.join(__dirname, '../public/test-video.mp4'),
  ];
  
  // Si no hay archivos de prueba específicos, usar un argumento de línea de comandos
  if (testFiles.length === 0 && process.argv.length > 2) {
    testFiles.push(process.argv[2]);
  }
  
  // Si aún no hay archivos de prueba, mostrar mensaje
  if (testFiles.length === 0) {
    log('\n⚠️ No se especificaron archivos de prueba.', colors.yellow);
    log('Uso: node scripts/test-cloudinary.js [ruta-al-archivo]', colors.yellow);
    log('Por ejemplo: node scripts/test-cloudinary.js ./public/test-image.jpg', colors.yellow);
    return;
  }
  
  // Probar subida de archivos
  let successCount = 0;
  for (const filePath of testFiles) {
    const uploadSuccess = await testUpload(filePath);
    if (uploadSuccess) {
      successCount++;
    }
  }
  
  // Mostrar resumen
  log('\n📊 Resumen de pruebas:', colors.cyan);
  log(`🔹 Total de pruebas: ${testFiles.length}`, colors.blue);
  log(`🔹 Pruebas exitosas: ${successCount}`, colors.green);
  log(`🔹 Pruebas fallidas: ${testFiles.length - successCount}`, colors.red);
  
  if (successCount === testFiles.length) {
    log('\n🎉 Todas las pruebas fueron exitosas!', colors.green);
  } else {
    log('\n⚠️ Algunas pruebas fallaron. Revisa los errores anteriores.', colors.yellow);
  }
}

// Ejecutar el script
runTests().catch(error => {
  log(`❌ Error inesperado: ${error.message}`, colors.red);
  console.error(error);
}); 