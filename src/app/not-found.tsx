"use client";

import Link from "next/link";
import Header from "./components/Header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-secondary dark:bg-gray-900">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 pt-[120px] pb-8 flex flex-col items-center text-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md w-full max-w-lg p-8">
          {/* Número 404 grande */}
          <h1 className="text-[120px] font-bold leading-none bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            404
          </h1>
          
          {/* Mensaje de página no encontrada */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Página no encontrada
          </h2>
          
          {/* Descripción amigable */}
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            La página que estás buscando no existe o ha sido movida.
            <br />No te preocupes, puedes volver a explorar el contenido de Fanero.
          </p>
          
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/"
              className="w-full sm:w-auto px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-full font-semibold transition shadow-md flex items-center justify-center dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Ir al inicio
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-full font-semibold transition shadow-md flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
              </svg>
              Volver atrás
            </button>
          </div>
        </div>
        
        {/* Nota informativa adicional */}
        <p className="text-gray-500 dark:text-gray-400 mt-8">
          Si crees que esto es un error, por favor contáctanos en{" "}
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