import nodemailer from "nodemailer";

// Configuración del transporte de correo
const createTransporter = () => {
  // Para entorno de desarrollo, usa un servidor de prueba que captura los correos
  if (process.env.NODE_ENV === "development" && !process.env.GMAIL_USER) {
    console.log("Usando servidor de correo de prueba para desarrollo");
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: "ethereal.user@ethereal.email", // Este valor será reemplazado por createTestAccount
        pass: "ethereal.pass", // Este valor será reemplazado por createTestAccount
      },
    });
  }

  // Para producción o si se proporciona configuración de Gmail
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Contraseña de aplicación, no la contraseña regular
    },
  });
};

// Función para enviar correo electrónico de restablecimiento de contraseña
export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string
) => {
  try {
    // Si estamos en desarrollo y no hay credenciales de Gmail, usar cuenta de prueba
    let testAccount;
    let transporter;

    if (process.env.NODE_ENV === "development" && !process.env.GMAIL_USER) {
      testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } else {
      transporter = createTransporter();
    }

    // Opciones del correo
    const mailOptions = {
      from: `"Fanero" <${process.env.GMAIL_USER || "noreply@fanero.com"}>`,
      to: email,
      subject: "Restablecimiento de contraseña - Fanero",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h1 style="color: #4F46E5; text-align: center; margin-bottom: 20px;">Fanero</h1>
          <h2 style="color: #333; margin-bottom: 20px;">Recuperación de contraseña</h2>
          <p style="margin-bottom: 30px; color: #555; line-height: 1.5;">
            Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:
          </p>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Restablecer contraseña
            </a>
          </div>
          <p style="margin-bottom: 10px; color: #555; line-height: 1.5;">
            Si no solicitaste este cambio, puedes ignorar este mensaje y tu contraseña seguirá siendo la misma.
          </p>
          <p style="margin-bottom: 10px; color: #555; line-height: 1.5;">
            Este enlace expirará en 1 hora por razones de seguridad.
          </p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777; font-size: 12px; text-align: center;">
            <p>&copy; ${new Date().getFullYear()} Fanero. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);

    // Si estamos usando una cuenta de prueba, mostrar la URL de vista previa
    if (testAccount) {
      console.log("URL de vista previa:", nodemailer.getTestMessageUrl(info));
      return {
        success: true,
        previewUrl: nodemailer.getTestMessageUrl(info),
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al enviar correo de restablecimiento:", error);
    return { success: false, error };
  }
}; 