import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import cloudinary from 'cloudinary';

// Configurar Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Función para procesar la carga de medios a Cloudinary
async function uploadToCloudinary(file: File): Promise<string> {
  try {
    // Convertir archivo a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Convertir buffer a base64 string
    const base64String = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64String}`;
    
    // Determinar carpeta según tipo de archivo
    const isVideo = file.type.startsWith('video/');
    const folder = isVideo ? 'fanero_videos' : 'fanero_images';
    
    // Subir a Cloudinary
    const uploadResult = await new Promise<cloudinary.UploadApiResponse>((resolve, reject) => {
      const uploadOptions: cloudinary.UploadApiOptions = {
        folder,
        resource_type: isVideo ? 'video' : 'image',
        // Para videos grandes, usar upload_large
        ...(isVideo && { chunk_size: 6000000 }) // 6MB chunks para videos
      };
      
      cloudinary.v2.uploader.upload(dataURI, uploadOptions, (error, result) => {
        if (error || !result) reject(error);
        else resolve(result);
      });
    });
    
    return uploadResult.secure_url;
  } catch (error) {
    console.error('Error cargando archivo a Cloudinary:', error);
    throw new Error('Error al cargar el archivo a la nube');
  }
}

// GET - Obtener posts (con paginación)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Construir condiciones de búsqueda
    const where = userId ? { userId } : {};
    
    // Obtener posts con paginación
    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
    
    // Contar total para paginación
    const total = await prisma.post.count({ where });
    
    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
    
  } catch (error: any) {
    console.error('Error obteniendo posts:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo post
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Verificar si es creador
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isCreator: true }
    });
    
    if (!user || !user.isCreator) {
      return NextResponse.json(
        { success: false, message: 'Solo los creadores pueden publicar contenido' },
        { status: 403 }
      );
    }
    
    // Procesar FormData
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const mediaFile = formData.get('media') as File | null;
    const isExclusive = formData.get('isExclusive') === 'true';
    
    // Validar datos
    if (!content && !mediaFile) {
      return NextResponse.json(
        { success: false, message: 'Se requiere contenido o media' },
        { status: 400 }
      );
    }
    
    // Procesar carga de archivos si hay
    let imageUrl = null;
    if (mediaFile) {
      imageUrl = await uploadToCloudinary(mediaFile);
    }
    
    // Crear post en la base de datos
    const post = await prisma.post.create({
      data: {
        title: title || (mediaFile ? 'Publicación con media' : 'Nueva publicación'),
        content: content || '',  // Asegurar que nunca sea null
        imageUrl,
        isExclusive,
        userId: session.user.id
      }
    });
    
    return NextResponse.json(
      {
        success: true,
        message: 'Post creado exitosamente',
        post: {
          id: post.id,
          content: post.content,
          imageUrl: post.imageUrl,
          createdAt: post.createdAt
        }
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Error creando post:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 