"use client";

import { useState } from 'react';
import Header from './Header';
import PostCard from './PostCard';

// Datos de ejemplo para mostrar en el feed
const MOCK_POSTS = [
  {
    id: 1,
    username: 'artista_digital',
    avatarSrc: '/avatar-placeholder.jpg',
    imageSrc: '/post-1.jpg',
    content: 'Estoy muy emocionado de compartir mi último trabajo digital. ¡Me encantaría saber qué piensan!',
    likesCount: 42,
    commentsCount: 8,
    timestamp: 'Hace 2 horas'
  },
  {
    id: 2,
    username: 'fotografo_nature',
    avatarSrc: '/avatar-placeholder.jpg',
    imageSrc: '/post-2.jpg',
    content: 'Capturé este amanecer durante mi último viaje a las montañas. La luz natural es simplemente mágica.',
    likesCount: 78,
    commentsCount: 12,
    timestamp: 'Hace 5 horas'
  },
  {
    id: 3,
    username: 'escritor_creativo',
    avatarSrc: '/avatar-placeholder.jpg',
    imageSrc: '/post-3.jpg',
    content: 'Acabo de terminar el primer borrador de mi novela. Ha sido un largo viaje, pero finalmente puedo ver la luz al final del túnel. Gracias a todos por su apoyo constante.',
    likesCount: 124,
    commentsCount: 23,
    timestamp: 'Ayer'
  }
];

export default function FeedPage() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  
  return (
    <div className="min-h-screen bg-secondary dark:bg-gray-900">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 pt-[90px] pb-8">
        <div className="flex justify-between items-center my-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Novedades</h1>
          <a 
            href="/" 
            className="btn bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-full flex items-center space-x-1 transition shadow-sm dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <span>Descubrir Creadores</span>
          </a>
        </div>
        
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard
              key={post.id}
              username={post.username}
              avatarSrc={post.avatarSrc}
              imageSrc={post.imageSrc}
              content={post.content}
              likesCount={post.likesCount}
              commentsCount={post.commentsCount}
              timestamp={post.timestamp}
            />
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <button className="btn text-primary dark:text-primary font-medium hover:underline">
            Cargar más publicaciones
          </button>
        </div>
      </main>
    </div>
  );
} 