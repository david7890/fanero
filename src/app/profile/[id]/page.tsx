"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Header from "../../components/Header";
import PostCard from "../../components/PostCard";
import NewPostForm from "../../components/NewPostForm";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  image: string;
  bio: string;
  isCreator?: boolean;
  creatorDescription?: string;
  subscriptionPrice?: number;
  bannerImage?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

// Caché para almacenar datos de perfiles
interface ProfileCache {
  [key: string]: {
    user: User | null;
    posts: Post[];
    isSubscribed: boolean;
    isOwnProfile: boolean;
    timestamp: number;
  };
}

// Caché global para persistir entre renderizados
const globalProfileCache: ProfileCache = {};
const CACHE_EXPIRY_TIME = 60000; // 1 minuto en milisegundos

export default function ProfilePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [donationAmount, setDonationAmount] = useState(5);
  const [donationMessage, setDonationMessage] = useState("");
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isCacheUsed, setIsCacheUsed] = useState(false);
  const initialLoadComplete = useRef(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // No recargar si ya se completó la carga inicial y solo estamos cambiando de pestaña
    if (initialLoadComplete.current && user) {
      return;
    }

    // Función para cargar los datos del perfil
    const fetchProfileData = async () => {
      try {
        // Verificar si tenemos datos en caché que no estén expirados
        const cachedData = globalProfileCache[id as string];
        const now = Date.now();
        
        if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRY_TIME) {
          setUser(cachedData.user);
          setPosts(cachedData.posts);
          setIsOwnProfile(cachedData.isOwnProfile);
          setIsSubscribed(cachedData.isSubscribed);
          setIsLoading(false);
          setIsCacheUsed(true);
          initialLoadComplete.current = true;
          return;
        }
        
        // Si no hay caché o está expirada, cargar desde la API
        setIsLoading(true);
        setError("");
        setIsCacheUsed(false);

        const response = await fetch(`/api/profile/${id}`);
        
        // Manejar errores de red o de servidor
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          
          if (response.status === 404) {
            throw new Error("Usuario no encontrado. Verifica la URL e intenta de nuevo.");
          } else if (response.status === 500) {
            throw new Error("Error en el servidor. Por favor, intenta más tarde.");
          } else {
            throw new Error(`Error al cargar el perfil (${response.status}). Por favor, intenta de nuevo.`);
          }
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || "Error al cargar el perfil");
        }
        
        // Mostrar primero los datos del usuario (carga progresiva)
        setUser(data.user);
        setIsOwnProfile(data.isOwnProfile);
        
        // Verificar si el usuario está suscrito desde la respuesta de la API
        if (data.isSubscribed !== undefined) {
          setIsSubscribed(data.isSubscribed);
        }
        
        // Guardar en caché y actualizar los posts después
        globalProfileCache[id as string] = {
          user: data.user,
          posts: data.posts,
          isOwnProfile: data.isOwnProfile,
          isSubscribed: data.isSubscribed || false,
          timestamp: Date.now()
        };
        
        // Actualizar posts después de mostrar la información del usuario
        setPosts(data.posts);
        setIsLoading(false);
        initialLoadComplete.current = true;
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        setError(error.message || "Error al cargar el perfil. Por favor, intenta de nuevo.");
        setIsLoading(false);
        initialLoadComplete.current = true;
      }
    };

    if (id) {
      fetchProfileData();
    }
    
    // Añadir evento para refrescar datos al volver a la pestaña
    const handleVisibilityChange = () => {
      if (!document.hidden && initialLoadComplete.current) {
        // Solo actualizar en segundo plano si hay datos en caché y no estamos ya cargando
        if (globalProfileCache[id as string] && !isLoading) {
          // Refrescar datos en segundo plano sin mostrar el spinner de carga
          fetchProfileData();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [id, session, isLoading]);

  const handleDonation = async () => {
    if (!session?.user) {
      // Redirigir a inicio de sesión si no está autenticado
      window.location.href = `/auth/login?callbackUrl=/profile/${id}`;
      return;
    }

    try {
      setIsDonating(true);

      // En una implementación real, esta sería una llamada a tu API
      // const response = await fetch('/api/donations', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     toUserId: id,
      //     amount: donationAmount,
      //     message: donationMessage,
      //   }),
      // });
      
      // const data = await response.json();
      
      // if (!response.ok) {
      //   throw new Error(data.message || 'Error al procesar la donación');
      // }

      // Simular procesamiento de donación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDonationSuccess(true);
      updateCacheAfterDonation();
      
      setTimeout(() => {
        setShowDonationModal(false);
        setDonationSuccess(false);
        setDonationAmount(5);
        setDonationMessage("");
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Error al procesar la donación. Por favor, intenta de nuevo.");
    } finally {
      setIsDonating(false);
    }
  };

  const handleSubscribe = async () => {
    if (!session?.user) {
      // Guardar la URL actual en localStorage antes de redirigir
      localStorage.setItem('redirectAfterLogin', window.location.href);
      // Redirigir a inicio de sesión
      window.location.href = `/auth/login?callbackUrl=/profile/${id}`;
      return;
    }

    try {
      setIsSubscribing(true);

      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorId: id,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la suscripción');
      }
      
      setSubscriptionSuccess(true);
      setIsSubscribed(true);
      updateCacheAfterSubscription(true);
      
      setTimeout(() => {
        setShowSubscribeModal(false);
        setSubscriptionSuccess(false);
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Error al procesar la suscripción. Por favor, intenta de nuevo.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/subscriptions?creatorId=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cancelar la suscripción');
      }
      
      setIsSubscribed(false);
      updateCacheAfterSubscription(false);
    } catch (error: any) {
      setError(error.message || "Error al cancelar la suscripción. Por favor, intenta de nuevo.");
    }
  };

  // Actualizar el caché después de una donación exitosa
  const updateCacheAfterDonation = () => {
    if (globalProfileCache[id as string]) {
      globalProfileCache[id as string].timestamp = Date.now();
    }
  };

  // Actualizar el caché después de cambiar la suscripción
  const updateCacheAfterSubscription = (newIsSubscribed: boolean) => {
    if (globalProfileCache[id as string]) {
      globalProfileCache[id as string].isSubscribed = newIsSubscribed;
      globalProfileCache[id as string].timestamp = Date.now();
      
      // Refrescar los posts si cambió el estado de suscripción
      // para mostrar u ocultar contenido exclusivo
      if (newIsSubscribed !== isSubscribed) {
        // Reiniciar la carga de posts
        const fetchUpdatedPosts = async () => {
          try {
            const response = await fetch(`/api/profile/${id}`);
            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                setPosts(data.posts);
                // Actualizar también los posts en caché
                if (globalProfileCache[id as string]) {
                  globalProfileCache[id as string].posts = data.posts;
                }
              }
            }
          } catch (error) {
            console.error("Error refreshing posts after subscription change:", error);
          }
        };
        
        fetchUpdatedPosts();
      }
    }
  };

  // Efecto para manejar la redirección después del login
  useEffect(() => {
    if (session?.user) {
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin');
        if (window.location.href !== redirectUrl) {
          window.location.href = redirectUrl;
        }
      }
    }
  }, [session]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary dark:bg-gray-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 pt-[90px] pb-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary dark:bg-gray-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 pt-[90px] pb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-500 mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Error</h2>
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-md text-center">
                {error}
              </div>
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-full font-semibold transition shadow-md flex items-center dark:bg-blue-600 dark:hover:bg-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Intentar de nuevo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary dark:bg-gray-900">
      <Header />
      
      {/* Indicador de datos en caché (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && isCacheUsed && (
        <div className="fixed top-20 left-4 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs p-2 rounded z-10">
          Usando datos en caché
        </div>
      )}
      
      <main className="max-w-4xl mx-auto px-4 pt-[90px] pb-8">
        {/* Información del perfil */}
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md mb-8">
          <div className="relative h-48 bg-gradient-to-r from-primary to-accent">
            {/* Banner del perfil */}
            {user?.bannerImage && (
              <img 
                src={user.bannerImage} 
                alt="Banner" 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute top-20 right-4 bg-yellow-100 text-xs p-1 rounded">
              isOwnProfile: {isOwnProfile ? 'true' : 'false'}, 
              isCreator: {user?.isCreator ? 'true' : 'false'}
            </div>
          )}
          
          {/* Contenido de perfil - Nuevo diseño con disposición vertical */}
          <div className="px-6 pt-0 pb-6 flex flex-col items-center">
            {/* Foto de perfil más grande y centrada */}
            <div className="w-40 h-40 mt-[-4rem] bg-white dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-700 overflow-hidden shadow-md mb-4">
              {user?.image ? (
                <Image 
                  src={user.image} 
                  alt={`${user?.name}'s avatar`}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <Image 
                  src="/avatar-placeholder.jpg"
                  alt="Avatar placeholder"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            {/* Nombre e insignia de creador */}
            <div className="flex items-center mb-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
              {user?.isCreator && (
                <>
                  <div className="relative group ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-500 cursor-help">
                      <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      Creador verificado
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                  <span className="ml-3 px-3 py-1 bg-accent text-black dark:text-white text-sm rounded-full font-medium">
                    Creador
                  </span>
                </>
              )}
            </div>
            
            {/* Descripción */}
            <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mb-6">
              {user?.isCreator ? user.creatorDescription : user?.bio}
            </p>

            {/* Precio de suscripción (solo visible para creadores en su propio perfil) */}
            {isOwnProfile && user?.isCreator && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6 max-w-md mx-auto">
                <div className="flex justify-between items-center gap-8">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Precio de suscripción mensual</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Se renueva automáticamente</p>
                  </div>
                  <p className="font-bold text-xl text-gray-900 dark:text-white whitespace-nowrap">${user.subscriptionPrice?.toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* Redes sociales para creadores */}
            {user?.isCreator && user?.socialLinks && (
              <div className="flex space-x-5 mb-6">
                {user.socialLinks.twitter && (
                  <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </a>
                )}
                {user.socialLinks.instagram && (
                  <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {user.socialLinks.tiktok && (
                  <a href={user.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 015.18-1.76V11.1a8.19 8.19 0 005.24 1.94v-3.45a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 015.18-1.76V11.1a8.19 8.19 0 005.24 1.94V6.69z" />
                    </svg>
                  </a>
                )}
                {user.socialLinks.youtube && (
                  <a href={user.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
            
            {/* Botones de acción */}
            {!isOwnProfile && (
              <div className="flex flex-wrap justify-center gap-3">
                {user?.isCreator && (
                  <>
                    {isSubscribed ? (
                      <button 
                        onClick={handleCancelSubscription}
                        className="px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-full font-semibold transition shadow-md flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Suscrito
                      </button>
                    ) : (
                      <button 
                        onClick={() => setShowSubscribeModal(true)}
                        className="px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-full font-semibold transition shadow-md flex items-center dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                        </svg>
                        {session?.user ? `Suscribirse $${user?.subscriptionPrice?.toFixed(2)}/mes` : 'Crear cuenta para suscribirte'}
                      </button>
                    )}
                  </>
                )}
                
                <button 
                  onClick={() => setShowDonationModal(true)}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition shadow-md flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>
                  Apoyar
                </button>
                
                <button 
                  onClick={() => {
                    const currentShareUrl = window.location.href;
                    setShareUrl(currentShareUrl);
                    setShowShareModal(true);
                    
                    // Solo intentar compartir nativo si el navegador lo soporta
                    if (navigator.share) {
                      navigator.share({
                        title: `Perfil de ${user?.name} en Fanero`,
                        text: `¡Mira el perfil de ${user?.name} en Fanero!`,
                        url: currentShareUrl,
                      })
                      .catch((error) => {
                        console.log('Error al compartir', error);
                        // Si falla el compartir nativo, mostrar el modal
                        setShowShareModal(true);
                      });
                    } else {
                      // Mostrar modal para navegadores que no soportan Web Share API
                      setShowShareModal(true);
                    }
                  }}
                  className="px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-full font-semibold transition shadow-md flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 0 2.25 2.25 0 00-3.935 0z" />
                  </svg>
                  Compartir
                </button>
              </div>
            )}
            
            {/* "Convertirme en creador" button - Show only if viewing own profile and user is NOT a creator */}
            {isOwnProfile && !user?.isCreator && (
              <div className="mt-4">
                <a 
                  href="/creator/setup"
                  className="px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-full font-semibold transition shadow-md flex items-center dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                  Convertirme en creador
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Formulario para crear posts (solo visible para creadores en su propio perfil) */}
        {isOwnProfile && user?.isCreator && (
          <NewPostForm 
            onPostCreated={() => {
              // Recargar los posts cuando se crea uno nuevo
              const fetchProfileData = async () => {
                try {
                  const response = await fetch(`/api/posts?userId=${id}`);
                  if (response.ok) {
                    const data = await response.json();
                    setPosts(data.posts);
                  }
                } catch (error) {
                  console.error("Error refreshing posts:", error);
                }
              };
              
              fetchProfileData();
            }} 
          />
        )}
        
        {/* Posts del usuario */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Publicaciones recientes</h2>
          
          {user && (
            <>
              {isLoading && posts.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center text-gray-500 dark:text-gray-400">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ) : posts.length > 0 ? (
                posts.map(post => (
                  <PostCard
                    key={post.id}
                    username={post.user.name}
                    avatarSrc={post.user.image || "/avatar-placeholder.jpg"}
                    imageSrc={post.imageUrl || "/post-placeholder.jpg"}
                    content={post.content}
                    likesCount={post._count?.likes || 0}
                    commentsCount={post._count?.comments || 0}
                    timestamp={new Date(post.createdAt).toLocaleDateString()}
                    isCreatorPost={user?.isCreator}
                    isSubscribed={isOwnProfile || isSubscribed}
                    creatorId={user?.id}
                    subscriptionPrice={user?.subscriptionPrice || 5.99}
                  />
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center text-gray-500 dark:text-gray-400">
                  No hay publicaciones para mostrar.
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      {/* Modal de donación */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Apoyar a {user?.name}
            </h3>
            
            {donationSuccess ? (
              <div className="text-center py-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-green-500 mx-auto mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0118 0Z" />
                </svg>

                <p className="text-lg font-semibold text-gray-900 dark:text-white">¡Gracias por tu apoyo!</p>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Tu donación ha sido procesada exitosamente.</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Tu apoyo ayuda a que {user?.name} pueda seguir creando contenido increíble.
                  </p>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cantidad (USD)
                    </label>
                    <div className="flex space-x-2">
                      {[5, 10, 20, 50].map(amount => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setDonationAmount(amount)}
                          className={`py-2 px-4 rounded-md ${
                            donationAmount === amount
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
                          }`}
                        >
                          ${amount}
                        </button>
                      ))}
                      <input
                        type="number"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(Number(e.target.value))}
                        min="1"
                        step="1"
                        className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mensaje (opcional)
                    </label>
                    <textarea
                      value={donationMessage}
                      onChange={(e) => setDonationMessage(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                      placeholder="Deja un mensaje de apoyo..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDonationModal(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDonation}
                    disabled={isDonating || donationAmount <= 0}
                    className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDonating ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </span>
                    ) : (
                      "Donar $" + donationAmount
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de suscripción */}
      {showSubscribeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {session?.user ? `Suscribirse a ${user?.name}` : 'Crear cuenta para suscribirte'}
            </h3>
            
            {subscriptionSuccess ? (
              <div className="text-center py-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-green-500 mx-auto mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>

                <p className="text-lg font-semibold text-gray-900 dark:text-white">¡Gracias por suscribirte!</p>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Ahora tienes acceso al contenido exclusivo.</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {session?.user 
                      ? `Al suscribirte obtendrás acceso al contenido exclusivo de ${user?.name}.`
                      : 'Para acceder al contenido exclusivo, necesitas crear una cuenta.'}
                  </p>
                  
                  {session?.user && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Suscripción mensual</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Se renueva automáticamente</p>
                        </div>
                        <p className="font-bold text-xl text-gray-900 dark:text-white">${user?.subscriptionPrice?.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                  
                  {session?.user && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Al suscribirte, aceptas procesar un pago mensual recurrente. Puedes cancelar en cualquier momento.
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowSubscribeModal(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubscribe}
                    disabled={isSubscribing}
                    className="flex-1 py-2 px-4 bg-gray-900 hover:bg-black text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    {isSubscribing ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </span>
                    ) : session?.user ? (
                      `Suscribirme por $${user?.subscriptionPrice?.toFixed(2)}/mes`
                    ) : (
                      'Crear cuenta'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de compartir */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Compartir perfil
            </h3>
            
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Comparte el perfil de {user?.name} con tus amigos
              </p>
              
              <div className="flex items-center mb-4">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="py-2 px-4 bg-gray-900 hover:bg-black text-white rounded-r-md font-semibold dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                  )}
                </button>
              </div>
              
              {copied && (
                <div className="text-sm text-green-600 dark:text-green-400 mb-4">
                  ¡Enlace copiado al portapapeles!
                </div>
              )}
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4">
                <p className="font-medium text-gray-800 dark:text-white mb-2">Mensaje para compartir:</p>
                <p className="text-gray-600 dark:text-gray-300 italic">
                  "¡Hola! Te comparto el perfil de {user?.name} en Fanero. ¡Échale un vistazo!"
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="font-medium text-gray-800 dark:text-white">Compartir en redes sociales:</p>
                <div className="flex space-x-4">
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`¡Mira el perfil de ${user?.name} en Fanero!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-400 dark:text-gray-400 dark:hover:text-blue-300"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </a>
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>
                  <a 
                    href={`https://wa.me/?text=${encodeURIComponent(`¡Mira el perfil de ${user?.name} en Fanero! ${shareUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 