"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthStatus() {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Evitar problemas de hidratación
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  // No renderizar nada en el servidor para evitar problemas de hidratación
  if (!isMounted) {
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/auth/login" className="text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition">
          Iniciar sesión
        </Link>
        <Link href="/auth/register" className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-full transition shadow-md">
          Registrarse
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        className="flex items-center space-x-2 cursor-pointer"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
          {session?.user?.image ? (
            <Image 
              src={session.user.image} 
              alt={`${session.user.name}'s avatar`}
              width={32}
              height={32}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <Image 
              src="/avatar-placeholder.png" 
              alt="Avatar predeterminado"
              width={32}
              height={32}
              className="w-full h-full object-cover"
              unoptimized
            />
          )}
        </div>
        <span className="text-gray-800 dark:text-gray-200">
          {session?.user?.name || session?.user?.email?.split('@')[0]}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{session?.user?.name}</p>
              {/* Verificación de creador - necesitaríamos acceder a esta info desde la API */}
              {/* Dejamos preparado el icono pero lo ocultamos hasta que tengamos esa información */}
              {false && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-1 text-blue-500">
                  <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session?.user?.email}</p>
          </div>
          <div className="py-1">
            <Link href={`/profile/${session?.user?.id}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Mi perfil
            </Link>
            <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Configuración
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 