import { NextRequest, NextResponse } from 'next/server';
import cloudinary from 'cloudinary';

// Configurar Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: NextRequest) {
  try {
    // Procesar FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }
    
    // Log del tipo de archivo y tamaño
    console.log(`Procesando archivo: ${file.name}, tipo: ${file.type}, tamaño: ${file.size} bytes`);
    
    // Convertir archivo a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Convertir buffer a base64 string
    const base64String = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64String}`;
    
    // Determinar tipo de recurso
    const isVideo = file.type.startsWith('video/');
    const folder = "tests"; // Carpeta especial para pruebas
    
    // Subir a Cloudinary con un ID único basado en la hora
    const uniqueId = `test_${Date.now()}`;
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadOptions = {
        folder,
        resource_type: isVideo ? 'video' : 'image' as 'video' | 'image' | 'raw' | 'auto',
        public_id: uniqueId
      };
      
      cloudinary.v2.uploader.upload(dataURI, uploadOptions, (error, result) => {
        if (error || !result) reject(error);
        else resolve(result);
      });
    });
    
    return NextResponse.json({
      success: true,
      message: 'Archivo subido exitosamente a Cloudinary',
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
      },
      cloudinary: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        format: uploadResult.format,
        resourceType: uploadResult.resource_type,
        version: uploadResult.version
      }
    });
    
  } catch (error: any) {
    console.error('Error en prueba de Cloudinary:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al subir archivo a Cloudinary', 
        error: error.message || 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para verificar la configuración
export async function GET() {
  try {
    // Verificar credenciales sin subir archivos
    const result = await cloudinary.v2.api.ping();
    
    return NextResponse.json({
      success: true,
      message: 'Conexión a Cloudinary establecida correctamente',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKeyConfigured: !!process.env.CLOUDINARY_API_KEY,
      apiSecretConfigured: !!process.env.CLOUDINARY_API_SECRET,
      cloudinaryResponse: result
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al conectar con Cloudinary', 
        error: error.message || 'Error desconocido' 
      },
      { status: 500 }
    );
  }
} 