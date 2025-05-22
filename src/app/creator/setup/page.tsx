"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";

export default function CreatorSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [creatorData, setCreatorData] = useState({
    creatorDescription: "",
    subscriptionPrice: "4.99",
    bannerImage: "",
    socialLinks: {
      twitter: "",
      instagram: "",
      tiktok: "",
      youtube: ""
    }
  });

  // Redirigir si no está autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/creator/setup");
    } else if (status === "authenticated") {
      setIsLoading(false);
    }
  }, [status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCreatorData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreatorData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Validar precio de suscripción
      const price = parseFloat(creatorData.subscriptionPrice);
      if (isNaN(price) || price < 0.99 || price > 99.99) {
        setError("El precio de suscripción debe ser entre $0.99 y $99.99");
        setIsSubmitting(false);
        return;
      }

      // Enviar datos al servidor
      const response = await fetch("/api/user/creator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(creatorData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al configurar el perfil de creador");
      }

      setSuccess("¡Perfil de creador configurado correctamente!");
      
      // Redirigir al perfil después de 2 segundos
      setTimeout(() => {
        router.push(`/profile/${session?.user?.id}`);
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Error al configurar el perfil de creador");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-secondary dark:bg-gray-900">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 pt-[90px] pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configurar perfil de creador</h1>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-md mb-6">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-md mb-6">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="creatorDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción de tu perfil de creador
                </label>
                <textarea
                  id="creatorDescription"
                  name="creatorDescription"
                  value={creatorData.creatorDescription}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  placeholder="Describe qué tipo de contenido creas y por qué la gente debería suscribirse"
                  required
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="subscriptionPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Precio de suscripción mensual (USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">$</span>
                  </div>
                  <input
                    type="number"
                    id="subscriptionPrice"
                    name="subscriptionPrice"
                    value={creatorData.subscriptionPrice}
                    onChange={handleChange}
                    step="0.01"
                    min="0.99"
                    max="99.99"
                    className="w-full pl-7 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                    placeholder="4.99"
                    required
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Puedes establecer un precio entre $0.99 y $99.99 USD
                </p>
              </div>
              
              <div>
                <label htmlFor="bannerImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL de imagen de banner (opcional)
                </label>
                <input
                  type="url"
                  id="bannerImage"
                  name="bannerImage"
                  value={creatorData.bannerImage}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  placeholder="https://ejemplo.com/mi-banner.jpg"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Imagen de banner para tu perfil (recomendado: 1200 x 400 px)
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  Enlaces a redes sociales (opcional)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Twitter
                    </label>
                    <input
                      type="url"
                      id="twitter"
                      name="twitter"
                      value={creatorData.socialLinks.twitter}
                      onChange={handleSocialLinkChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                      placeholder="https://twitter.com/tu_usuario"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Instagram
                    </label>
                    <input
                      type="url"
                      id="instagram"
                      name="instagram"
                      value={creatorData.socialLinks.instagram}
                      onChange={handleSocialLinkChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                      placeholder="https://instagram.com/tu_usuario"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      TikTok
                    </label>
                    <input
                      type="url"
                      id="tiktok"
                      name="tiktok"
                      value={creatorData.socialLinks.tiktok}
                      onChange={handleSocialLinkChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                      placeholder="https://tiktok.com/@tu_usuario"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      YouTube
                    </label>
                    <input
                      type="url"
                      id="youtube"
                      name="youtube"
                      value={creatorData.socialLinks.youtube}
                      onChange={handleSocialLinkChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                      placeholder="https://youtube.com/@tu_canal"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-md font-semibold transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Activando perfil de creador...
                    </span>
                  ) : (
                    "Activar perfil de creador"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 