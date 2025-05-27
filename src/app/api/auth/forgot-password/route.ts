import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validación básica
    if (!email) {
      return NextResponse.json(
        { message: "El correo electrónico es requerido" },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // No revelar si el usuario existe por seguridad
    if (!user) {
      return NextResponse.json(
        { success: true, message: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña" },
        { status: 200 }
      );
    }

    // Generar token único
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Calcular fecha de expiración (1 hora)
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    // Eliminar tokens anteriores para este usuario
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    });

    // Crear nuevo token en la base de datos
    await prisma.passwordResetToken.create({
      data: {
        id: crypto.randomBytes(16).toString("hex"),
        token: resetToken,
        email: user.email,
        expires,
      },
    });

    // URL de restablecimiento
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}`;

    // Enviar correo electrónico
    const emailResult = await sendPasswordResetEmail(user.email, resetUrl);

    // Respuesta para el usuario
    const response = { 
      success: true, 
      message: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña"
    };
    
    // Solo en desarrollo, añadir información adicional para facilitar las pruebas
    if (process.env.NODE_ENV === 'development') {
      Object.assign(response, {
        devInfo: {
          resetUrl,
          token: resetToken,
          emailSent: emailResult.success,
          previewUrl: emailResult.previewUrl // Ethereal URL para previsualizar correos en desarrollo
        }
      });
    }
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error("Error al procesar solicitud de recuperación:", error);
    return NextResponse.json(
      { message: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
} 