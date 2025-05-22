import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Activar estatus de creador o actualizar perfil de creador
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { 
      creatorDescription, 
      subscriptionPrice, 
      bannerImage,
      socialLinks 
    } = body;

    // Validar datos
    if (subscriptionPrice !== undefined && (isNaN(subscriptionPrice) || subscriptionPrice < 0)) {
      return NextResponse.json(
        { success: false, message: "El precio de suscripción debe ser un número positivo" },
        { status: 400 }
      );
    }

    // Actualizar usuario a creador
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isCreator: true,
        creatorDescription: creatorDescription || undefined,
        subscriptionPrice: subscriptionPrice !== undefined ? parseFloat(subscriptionPrice) : undefined,
        bannerImage: bannerImage || undefined,
        socialLinks: socialLinks || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Perfil de creador actualizado correctamente",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        isCreator: updatedUser.isCreator,
        subscriptionPrice: updatedUser.subscriptionPrice,
      },
    });
  } catch (error: any) {
    console.error("Error al actualizar perfil de creador:", error);
    return NextResponse.json(
      { success: false, message: "Error al actualizar perfil de creador" },
      { status: 500 }
    );
  }
}

// Obtener información del usuario como creador
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Obtener usuario con información de creador
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        isCreator: true,
        creatorDescription: true,
        subscriptionPrice: true,
        bannerImage: true,
        socialLinks: true,
        _count: {
          select: {
            subscribers: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error("Error al obtener información de creador:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener información de creador" },
      { status: 500 }
    );
  }
} 