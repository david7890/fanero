"use client";

import { useEffect } from "react";
import Link from "next/link";
import Header from "./components/Header";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Opcional: reportar el error a un servicio de análisis
    console.error("Error en la aplicación:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-secondary dark:bg-gray-900">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 pt-[120px] pb-8 flex flex-col items-center text-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md w-full max-w-lg p-8">
          {/* Icono de error */}
          <div className="mb-6 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          
          {/* Mensaje de error */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Algo salió mal
          </h2>
          
          {/* Descripción amigable */}
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Lo sentimos, ha ocurrido un error inesperado.
            <br />Puedes intentar nuevamente o volver al inicio.
          </p>
          
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-full font-semibold transition shadow-md flex items-center justify-center dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Intentar nuevamente
            </button>
            
            <Link 
              href="/"
              className="w-full sm:w-auto px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-full font-semibold transition shadow-md flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Ir al inicio
            </Link>
          </div>
        </div>
        
        {/* Información de desarrollo (solo visible en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-white dark:bg-gray-800 p-4 rounded-lg w-full max-w-lg text-left">
            <h3 className="font-semibold text-red-500 mb-2">Información del error (solo visible en desarrollo):</h3>
            <p className="font-mono text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
              {error.message}
            </p>
            {error.stack && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">Ver detalles técnicos</summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}
        
        {/* Nota informativa adicional */}
        <p className="text-gray-500 dark:text-gray-400 mt-8">
          Si el problema persiste, por favor contáctanos en{" "}
          <a 
            href="mailto:soporte@fanero.com" 
            className="text-primary hover:underline"
          >
            soporte@fanero.com
          </a>
        </p>
      </div>
    </div>
  );
} 