import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Obtener sesión para verificar si es administrador
    const session = await getServerSession(authOptions);
    
    // En un ambiente de producción, deberías verificar que es un admin
    // Esto es solo para desarrollo y diagnóstico
    
    // Obtener todos los usuarios con información básica
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isCreator: true,
        creatorDescription: true,
        subscriptionPrice: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        ...user,
        profileUrl: `/profile/${user.id}`,
      }))
    });
  } catch (error) {
    console.error("Error al obtener lista de perfiles:", error);
    return NextResponse.json({
      success: false,
      message: "Error al obtener lista de perfiles"
    }, { status: 500 });
  }
} 