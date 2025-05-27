"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [devInfo, setDevInfo] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    setDevInfo(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error al procesar la solicitud");
      }
      
      setSuccess(data.message);
      
      // Solo para desarrollo - En producción, esto no existiría
      if (process.env.NODE_ENV === 'development' && data.devInfo) {
        setDevInfo(data.devInfo);
      }
    } catch (error: any) {
      setError(error.message || "Ocurrió un error. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-primary dark:text-primary mb-6">Fanero</h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Recuperar contraseña
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-md mb-6">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-md mb-6">
              <p className="font-medium">{success}</p>
            </div>
            
            {/* Información de desarrollo - Solo visible en desarrollo */}
            {devInfo && (
              <div className="mt-6 p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-md text-left">
                <p className="font-medium mb-2">🚧 Información de desarrollo:</p>
                <p className="text-sm mb-1">
                  <span className="font-medium">URL de restablecimiento:</span>
                </p>
                <p className="text-xs overflow-x-auto bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded mb-2">
                  <Link href={devInfo.resetUrl} className="text-blue-600 dark:text-blue-400 underline">
                    {devInfo.resetUrl}
                  </Link>
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Token:</span>
                </p>
                <p className="text-xs overflow-x-auto bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded">
                  {devInfo.token}
                </p>
              </div>
            )}
            
            <div className="mt-6">
              <Link href="/auth/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
                Volver a inicio de sesión
              </Link>
            </div>
          </div>
        ) : (
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

            <button
              type="submit"
              className="w-full flex items-center justify-center py-3 bg-gray-900 hover:bg-black text-white rounded-md font-semibold transition-colors shadow-md mt-8"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Enviar enlace
                </span>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/auth/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 