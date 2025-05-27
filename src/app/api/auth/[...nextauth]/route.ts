import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Extender la interfaz Session para incluir un campo id
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos");
        }

        try {
          // Buscar usuario por email en la base de datos
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          // Verificar si el usuario existe
          if (!user) {
            throw new Error("no user found with this email");
          }

          // Verificar si tiene contraseña (podría ser un usuario que se registró con Google)
          if (!user.password) {
            throw new Error("Este usuario se registró con un proveedor externo. Por favor, inicia sesión con Google.");
          }

          // Verificar si la contraseña es correcta
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }

          // Solo devolver los datos necesarios, no incluir la contraseña
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error: any) {
          console.error("Error al autorizar:", error);
          throw new Error(error.message);
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login", // Página personalizada de inicio de sesión
    signOut: "/auth/logout",
    error: "/auth/error", // Error - p.ej. problemas de configuración de 2FA
    verifyRequest: "/auth/verify-request", // (usada para proveedores basados en email)
    newUser: "/", // Cambiar de "/auth/register" a "/" para evitar redirección a registro
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Asegurar redirección a la página principal después de inicio de sesión
      if (url.startsWith(baseUrl)) return url;
      // Si la URL es relativa (/auth/login, etc.), combinarla con la URL base
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // De lo contrario, regresar a la página principal
      return baseUrl;
    },
    signIn: async ({ user, account, profile }) => {
      // Permitir siempre el inicio de sesión con credenciales
      if (account?.provider === 'credentials') {
        return true;
      }
      
      // Si el usuario no tiene imagen, establecer la imagen predeterminada
      if (!user.image) {
        user.image = '/avatar-placeholder.png';
        
        // Actualizar la imagen en la base de datos si el usuario ya existe
        if (user.id) {
          await prisma.user.update({
            where: { id: user.id },
            data: { image: user.image }
          });
        }
      }
      
      // Para proveedores de OAuth, vincular con cuenta existente si el email coincide
      if (account?.provider && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });
        
        // Si el usuario existe pero no tiene una cuenta con el proveedor actual
        if (existingUser) {
          // Si no hay accounts relacionadas, o no hay una con este proveedor
          const hasAccountWithProvider = existingUser.accounts?.some(
            (acc) => acc.provider === account.provider
          );
          
          if (!hasAccountWithProvider) {
            // Vincular la nueva cuenta OAuth a la cuenta existente
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            });
            
            return true;
          }
        }
      }
      
      return true;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET!,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 