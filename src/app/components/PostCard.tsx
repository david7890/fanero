"use client";

import Image from 'next/image';
import { useState, memo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface PostCardProps {
  username: string;
  avatarSrc: string;
  imageSrc: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  timestamp: string;
  isCreatorPost?: boolean;
  isSubscribed?: boolean;
  creatorId?: string;
  subscriptionPrice?: number;
}

// Usar memo para evitar re-renderizados innecesarios
const PostCard = memo(function PostCard({
  username,
  avatarSrc,
  imageSrc,
  content,
  likesCount: initialLikesCount,
  commentsCount,
  timestamp,
  isCreatorPost = false,
  isSubscribed = false,
  creatorId = '',
  subscriptionPrice = 5.99
}: PostCardProps) {
  const { data: session } = useSession();
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleImageClick = () => {
    if (isCreatorPost && !isSubscribed) {
      // Redirigir directamente a la página de login si no está autenticado
      if (!session) {
        window.location.href = `/auth/login?callbackUrl=/profile/${creatorId}`;
      } else {
        window.location.href = `/profile/${creatorId}`;
      }
    }
  };

  // Determinar si se debe mostrar el efecto borroso
  const shouldBlur = isCreatorPost && !isSubscribed;

  // Manejar clic en el botón de suscripción
  const handleSubscribeClick = () => {
    if (!session) {
      // Redirigir a la página de inicio de sesión si no está autenticado
      window.location.href = `/auth/login?callbackUrl=/profile/${creatorId}`;
      return;
    }
    // Redirigir a la página de perfil del creador
    window.location.href = `/profile/${creatorId}`;
  };

  return (
    <article className="card bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
      <div className="p-4 flex items-center space-x-3">
        <div className="relative w-10 h-10">
          <Image
            src={avatarSrc || "/avatar-placeholder.png"}
            alt="Avatar"
            className="rounded-full object-cover"
            fill
            sizes="40px"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{username}</h3>
          <div className="flex items-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">{timestamp}</p>
            {isCreatorPost && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                {isSubscribed ? "Exclusivo" : "Solo suscriptores"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-700">
        {/* Skeleton para la carga de imagen */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-600 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}
        
        <div 
          className={`relative w-full aspect-[4/3] ${isCreatorPost && !isSubscribed ? 'cursor-pointer' : ''}`}
          onClick={handleImageClick}
        >
          <Image
            src={imageSrc}
            alt="Post image"
            className={`object-cover ${shouldBlur ? 'blur-2xl' : ''} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
          {isCreatorPost && !isSubscribed && (
            <div 
              className="absolute inset-0 flex items-center justify-center"
              onClick={handleImageClick}
            >
              <div className="bg-black/90 hover:bg-black transition-colors rounded-xl px-6 py-3 flex items-center space-x-3 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span className="text-white font-medium text-lg">Ver contenido exclusivo</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Aplicar efecto borroso al texto si es necesario */}
        <p className={`text-gray-800 dark:text-gray-200 mb-4 ${shouldBlur ? 'blur-sm' : ''}`}>
          {shouldBlur 
            ? content.substring(0, Math.min(content.length, 100)) + (content.length > 100 ? '...' : '') 
            : content}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLike}
              className="btn flex items-center space-x-1 focus:outline-none"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill={isLiked ? "currentColor" : "none"} 
                viewBox="0 0 24 24" 
                strokeWidth={isLiked ? 0 : 1.5} 
                stroke="currentColor" 
                className={`w-6 h-6 ${isLiked ? 'text-accent' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              <span className="text-gray-600 dark:text-gray-400">{likesCount}</span>
            </button>
            
            <button 
              onClick={() => setShowComments(!showComments)}
              className="btn flex items-center space-x-1 text-gray-600 dark:text-gray-400 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
              <span>{commentsCount}</span>
            </button>
          </div>
          
          <button className="btn text-gray-600 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Z" />
            </svg>
          </button>
        </div>
      </div>
      
      {showComments && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Mostrar comentarios...</p>
        </div>
      )}
    </article>
  );
});

export default PostCard; 