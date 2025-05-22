import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/user/profile - Obtener datos del perfil
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        isCreator: true,
        creatorDescription: true,
        subscriptionPrice: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener el perfil" },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Actualizar datos del perfil
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const creatorDescription = formData.get('creatorDescription') as string;
    const subscriptionPrice = formData.get('subscriptionPrice') as string;
    const image = formData.get('image') as File;

    // Validar datos básicos
    if (!name) {
      return NextResponse.json(
        { success: false, message: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Obtener usuario actual para verificar si es creador
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isCreator: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Preparar datos de actualización
    const updateData: any = {
      name,
      updatedAt: new Date(),
    };

    // Si es creador, actualizar campos adicionales
    if (currentUser.isCreator) {
      if (creatorDescription !== null) {
        updateData.creatorDescription = creatorDescription;
      }
      if (subscriptionPrice !== null) {
        const price = parseFloat(subscriptionPrice);
        if (!isNaN(price) && price >= 0) {
          updateData.subscriptionPrice = price;
        }
      }
    }

    // TODO: Implementar subida de imagen a un servicio de almacenamiento
    // Por ahora solo actualizamos los datos básicos

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        isCreator: true,
        creatorDescription: true,
        subscriptionPrice: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, message: "Error al actualizar el perfil" },
      { status: 500 }
    );
  }
} 