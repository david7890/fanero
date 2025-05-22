import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Crear una nueva suscripción
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

    const subscriberId = session.user.id;
    const body = await request.json();
    const { creatorId } = body;

    if (!creatorId) {
      return NextResponse.json(
        { success: false, message: "ID del creador requerido" },
        { status: 400 }
      );
    }

    // Verificar que el usuario no esté intentando suscribirse a sí mismo
    if (subscriberId === creatorId) {
      return NextResponse.json(
        { success: false, message: "No puedes suscribirte a ti mismo" },
        { status: 400 }
      );
    }

    // Verificar que el creador exista y sea un creador
    const creator = await prisma.user.findUnique({
      where: {
        id: creatorId,
        isCreator: true
      }
    });

    if (!creator) {
      return NextResponse.json(
        { success: false, message: "Creador no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si ya existe una suscripción activa
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        creatorId_subscriberId: {
          creatorId,
          subscriberId
        }
      }
    });

    if (existingSubscription && existingSubscription.status === "active") {
      return NextResponse.json(
        { success: false, message: "Ya estás suscrito a este creador" },
        { status: 400 }
      );
    }

    // Obtener el precio de suscripción del creador
    const subscriptionPrice = creator.subscriptionPrice || 4.99;

    // Crear fecha de finalización (un mes después)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    // En un sistema real, aquí iría la integración con un procesador de pagos
    // como Stripe o PayPal antes de crear la suscripción en la base de datos

    // Crear o actualizar la suscripción
    const subscription = await prisma.subscription.upsert({
      where: {
        creatorId_subscriberId: {
          creatorId,
          subscriberId
        }
      },
      update: {
        status: "active",
        amount: subscriptionPrice,
        startDate: new Date(),
        endDate
      },
      create: {
        creatorId,
        subscriberId,
        status: "active",
        amount: subscriptionPrice,
        endDate
      }
    });

    return NextResponse.json({
      success: true,
      message: "Suscripción creada correctamente",
      subscription
    });
  } catch (error: any) {
    console.error("Error al crear suscripción:", error);
    return NextResponse.json(
      { success: false, message: "Error al crear suscripción" },
      { status: 500 }
    );
  }
}

// Obtener suscripciones del usuario
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
    
    // Obtener suscripciones del usuario
    const subscriptions = await prisma.subscription.findMany({
      where: {
        subscriberId: userId,
        status: "active"
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            creatorDescription: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      subscriptions
    });
  } catch (error: any) {
    console.error("Error al obtener suscripciones:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener suscripciones" },
      { status: 500 }
    );
  }
}

// Cancelar una suscripción
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const creatorId = url.searchParams.get('creatorId');
    
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 }
      );
    }

    const subscriberId = session.user.id;

    if (!creatorId) {
      return NextResponse.json(
        { success: false, message: "ID del creador requerido" },
        { status: 400 }
      );
    }

    // Buscar la suscripción
    const subscription = await prisma.subscription.findUnique({
      where: {
        creatorId_subscriberId: {
          creatorId,
          subscriberId
        }
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, message: "Suscripción no encontrada" },
        { status: 404 }
      );
    }

    // Cancelar la suscripción
    await prisma.subscription.update({
      where: {
        id: subscription.id
      },
      data: {
        status: "cancelled"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Suscripción cancelada correctamente"
    });
  } catch (error: any) {
    console.error("Error al cancelar suscripción:", error);
    return NextResponse.json(
      { success: false, message: "Error al cancelar suscripción" },
      { status: 500 }
    );
  }
} 