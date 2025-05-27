"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from '../components/Header';
import Image from 'next/image';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    image: '',
    bio: '',
    isCreator: false,
    creatorDescription: '',
    subscriptionPrice: 5.99,
  });
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setPreviewImage(data.image || '/avatar-placeholder.png');
        }
      } catch (error) {
        setError('Error al cargar los datos del usuario');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('name', userData.name);
      
      if (userData.isCreator) {
        formData.append('creatorDescription', userData.creatorDescription);
        formData.append('subscriptionPrice', userData.subscriptionPrice.toString());
        if (newImage) {
          formData.append('image', newImage);
        }
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Perfil actualizado correctamente');
        // Actualizar los datos locales con la respuesta del servidor
        setUserData(prev => ({
          ...prev,
          ...data.user
        }));
      } else {
        throw new Error(data.message || 'Error al actualizar el perfil');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary dark:bg-gray-900">
        <Header />
        <div className="max-w-2xl mx-auto px-4 pt-[90px] pb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary dark:bg-gray-900">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 pt-[90px] pb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Configuración de la cuenta
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Correo electrónico (solo lectura) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={userData.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Foto de perfil (solo para creadores) */}
          {userData.isCreator && (
            <div className="flex items-center space-x-6">
              <div className="relative w-24 h-24">
                <Image
                  src={previewImage}
                  alt="Profile"
                  className="rounded-full object-cover"
                  fill
                  sizes="96px"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Foto de perfil
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-gray-900 file:text-white
                    dark:file:bg-blue-600
                    hover:file:bg-black dark:hover:file:bg-blue-700"
                />
              </div>
            </div>
          )}

          {/* Nombre de usuario */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de usuario
            </label>
            <input
              type="text"
              id="name"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Campos adicionales para creadores */}
          {userData.isCreator && (
            <>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción del creador
                </label>
                <textarea
                  id="description"
                  value={userData.creatorDescription}
                  onChange={(e) => setUserData({ ...userData, creatorDescription: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  placeholder="Cuéntale a tus seguidores sobre ti..."
                />
              </div>

              <div>
                <label htmlFor="subscriptionPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio de suscripción mensual (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-gray-500 dark:text-gray-400">$</span>
                  <input
                    type="number"
                    id="subscriptionPrice"
                    value={userData.subscriptionPrice}
                    onChange={(e) => setUserData({ ...userData, subscriptionPrice: parseFloat(e.target.value) })}
                    min="1"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-full font-semibold transition shadow-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
} 