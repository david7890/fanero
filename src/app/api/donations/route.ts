import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

// GET - Obtener donaciones recibidas por un usuario
export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || token.id;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Buscar donaciones recibidas por el usuario con información del donante
    const donations = await prisma.donation.findMany({
      where: { toUserId: userId as string },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Obtener el total de donaciones para la paginación
    const total = await prisma.donation.count({
      where: { toUserId: userId as string },
    });

    // Calcular el total recibido
    const totalAmount = await prisma.donation.aggregate({
      where: { toUserId: userId as string, status: "completed" },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      donations,
      totalReceived: totalAmount._sum.amount || 0,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener donaciones:", error);
    return NextResponse.json(
      { message: "Error al obtener donaciones" },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva donación (simulando el procesamiento de pago)
export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { toUserId, amount, message, currency = "USD" } = body;

    // Validación básica
    if (!toUserId || !amount || amount <= 0) {
      return NextResponse.json(
        { message: "Destinatario y monto válido son requeridos" },
        { status: 400 }
      );
    }

    // No permitir donaciones a uno mismo
    if (toUserId === token.id) {
      return NextResponse.json(
        { message: "No puedes donarte a ti mismo" },
        { status: 400 }
      );
    }

    // Simular procesamiento de pago exitoso
    // En una implementación real, aquí llamarías a Stripe u otro procesador de pagos

    // Crear donación
    const donation = await prisma.donation.create({
      data: {
        amount: parseFloat(amount),
        currency,
        message,
        status: "completed", // En un caso real, podría ser "pending" hasta confirmar el pago
        fromUserId: token.id as string,
        toUserId,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(donation, { status: 201 });
  } catch (error) {
    console.error("Error al procesar donación:", error);
    return NextResponse.json(
      { message: "Error al procesar donación" },
      { status: 500 }
    );
  }
} 