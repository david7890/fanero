"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (registered) {
      setSuccess("¡Registro exitoso! Ahora puedes iniciar sesión con tus credenciales.");
    }
  }, [registered]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setErrorDetails("");
    setSuccess("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        // Determinar tipo de error para dar feedback más específico
        if (result.error.includes("no user found")) {
          setError("No existe ninguna cuenta con este email.");
        } else if (result.error.includes("Invalid credentials")) {
          setError("Email o contraseña incorrectos.");
        } else {
          setError("Credenciales inválidas. Por favor, inténtalo de nuevo.");
          setErrorDetails(result.error);
        }
        setIsLoading(false);
        return;
      }

      // Redirigir al feed en caso de éxito o a la URL de callback
      router.push(callbackUrl);
      router.refresh();
    } catch (error: any) {
      setError("Ocurrió un error durante el inicio de sesión. Por favor, inténtalo de nuevo.");
      setErrorDetails(error.message || "Error desconocido");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signIn("google", { 
        callbackUrl: "/", 
        redirect: true 
      });
    } catch (error) {
      setError("Error al iniciar sesión con Google. Por favor, inténtalo de nuevo.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-primary dark:text-primary mb-6">Fanero</h1>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-md mb-6">
            <p className="font-medium">{error}</p>
            {errorDetails && <p className="text-sm mt-1 opacity-80">{errorDetails}</p>}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-md mb-6">
            <p className="font-medium">{success}</p>
          </div>
        )}

        <div className="mb-8">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center py-3 px-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            {googleLoading ? "Iniciando sesión..." : "Continuar con Google"}
          </button>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">o con tu email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white transition-colors"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:text-primary-dark transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center py-3 bg-gray-900 hover:bg-black text-white rounded-md font-semibold transition-colors shadow-md mt-8"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Iniciar sesión
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            ¿No tienes una cuenta?{" "}
            <Link href="/auth/register" className="text-primary hover:text-primary-dark font-medium transition-colors">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 