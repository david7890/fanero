import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Definir el tipo de Post para evitar errores de tipo implícito
type Post = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  _count: {
    likes: number;
    comments: number;
  };
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Asegurarnos de que params.id existe antes de usarlo
    const id = params?.id;
    
    // Validar ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: "ID de usuario inválido" },
        { status: 400 }
      );
    }
    
    console.log("API - Profile requested for ID:", id);
    
    // Verificar autenticación (opcional para perfiles públicos)
    const session = await getServerSession(authOptions);
    const isLoggedIn = !!session?.user;
    const currentUserId = session?.user?.id || '';
    const isOwnProfile = currentUserId === id;
    
    console.log("API - Session user ID:", currentUserId);
    console.log("API - Profile ID being viewed:", id);
    console.log("API - Is own profile:", isOwnProfile);
    
    // Obtener usuario con manejo de errores mejorado
    try {
      // Verificar si el usuario está suscrito al creador (si no es su propio perfil)
      let isSubscribed = false;
      
      if (isLoggedIn && !isOwnProfile && currentUserId) {
        try {
          const subscription = await prisma.subscription.findFirst({
            where: {
              creatorId: id,
              subscriberId: currentUserId,
              status: "active",
            },
          });
          
          isSubscribed = !!subscription;
        } catch (error) {
          console.error("Error checking subscription:", error);
          // Continuar sin marcar como suscrito en caso de error
        }
      }

      // Obtener usuario y posts en una sola consulta
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: isOwnProfile, // Solo devolver email si es el propio perfil
          image: true,
          bio: true,
          isCreator: true,
          creatorDescription: true,
          subscriptionPrice: true,
          bannerImage: true,
          socialLinks: true,
          _count: {
            select: {
              posts: true,
            },
          },
          // Incluir los posts del usuario
          posts: {
            where: {
              // Mostrar todos los posts si es el propio perfil o está suscrito
              // Si no está suscrito, mostrar solo los posts públicos
              ...((!isOwnProfile && !isSubscribed) ? { isExclusive: false } : {})
            },
            orderBy: { 
              createdAt: "desc" 
            },
            select: {
              id: true,
              title: true,
              content: true,
              imageUrl: true,
              createdAt: true,
              _count: {
                select: {
                  likes: true,
                  comments: true,
                },
              },
            },
          }
        },
      });

      if (!user) {
        console.log("API - User not found with ID:", id);
        return NextResponse.json(
          { success: false, message: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      console.log("API - User found:", {
        id: user.id,
        name: user.name,
        isCreator: user.isCreator
      });

      // Reformatear la respuesta para mantener compatibilidad con el frontend
      const postsWithUser = user.posts.map(post => ({
        ...post,
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
        }
      }));

      const response = {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          bio: user.bio,
          isCreator: user.isCreator,
          creatorDescription: user.creatorDescription,
          subscriptionPrice: user.subscriptionPrice,
          bannerImage: user.bannerImage,
          socialLinks: user.socialLinks,
          _count: user._count
        },
        posts: postsWithUser,
        isOwnProfile,
        isSubscribed: isOwnProfile ? false : isSubscribed
      };

      return NextResponse.json(response);
    } catch (dbError) {
      console.error("Database error when fetching user:", dbError);
      return NextResponse.json(
        { success: false, message: "Error en la base de datos al buscar el usuario" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("General error in profile API:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener información del perfil" },
      { status: 500 }
    );
  }
}

// Función auxiliar para verificar suscripción
async function checkSubscription(creatorId: string, subscriberId: string): Promise<boolean> {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        creatorId,
        subscriberId,
        status: "active",
      },
    });
    
    return !!subscription;
  } catch (error) {
    console.error("Error al verificar suscripción:", error);
    return false;
  }
} 