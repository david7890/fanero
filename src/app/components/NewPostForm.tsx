"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface NewPostFormProps {
  onPostCreated?: () => void;
}

export default function NewPostForm({ onPostCreated }: NewPostFormProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isExclusive, setIsExclusive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejar selección de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setError("");
    
    if (!file) {
      setMediaFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validar tipo de archivo
    const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const acceptedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    
    if (!acceptedImageTypes.includes(file.type) && !acceptedVideoTypes.includes(file.type)) {
      setError("El archivo debe ser una imagen (JPEG, PNG, GIF, WEBP) o un video (MP4, WEBM, MOV)");
      return;
    }

    // Validar tamaño (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("El archivo no debe superar los 10MB");
      return;
    }

    setIsVideo(acceptedVideoTypes.includes(file.type));
    setMediaFile(file);
    
    // Crear URL para previsualización
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    return () => URL.revokeObjectURL(objectUrl);
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      setError("Debes iniciar sesión para publicar");
      return;
    }
    
    if (content.trim() === "" && !mediaFile) {
      setError("Debes escribir algo o añadir una imagen/video");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Crear FormData para enviar archivos
      const formData = new FormData();
      if (title.trim()) {
        formData.append("title", title);
      }
      formData.append("content", content);
      if (mediaFile) {
        formData.append("media", mediaFile);
      }
      formData.append("isExclusive", isExclusive.toString());
      
      // Enviar a la API
      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
        // No incluir Content-Type para que el navegador lo configure automáticamente con el boundary para FormData
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al crear la publicación");
      }
      
      // Éxito
      setTitle("");
      setContent("");
      setMediaFile(null);
      setPreviewUrl(null);
      setSuccessMessage("¡Publicación creada con éxito!");
      
      // Notificar al componente padre si es necesario
      if (onPostCreated) {
        onPostCreated();
      }
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al crear la publicación");
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar archivo seleccionado
  const handleRemoveFile = () => {
    setMediaFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Crear nueva publicación
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Campo de título (opcional) */}
          <div className="mb-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              placeholder="Título (opcional)"
            />
          </div>
          
          {/* Área de texto */}
          <div className="mb-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white resize-none"
              placeholder="¿Qué quieres compartir con tus fans?"
            ></textarea>
          </div>
          
          {/* Previsualización de imagen/video */}
          {previewUrl && (
            <div className="mb-4 relative">
              <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                {isVideo ? (
                  <video 
                    src={previewUrl} 
                    controls 
                    className="max-h-80 mx-auto"
                  ></video>
                ) : (
                  <img 
                    src={previewUrl}
                    alt="Vista previa" 
                    className="max-h-80 mx-auto object-contain"
                  />
                )}
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-100 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Opción para contenido exclusivo */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="isExclusive"
              checked={isExclusive}
              onChange={(e) => setIsExclusive(e.target.checked)}
              className="w-4 h-4 text-primary focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="isExclusive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Contenido exclusivo para suscriptores
            </label>
          </div>
          
          {/* Mensajes de error o éxito */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-md text-sm">
              {successMessage}
            </div>
          )}
          
          {/* Botones de acción */}
          <div className="flex items-center justify-between">
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-full font-medium transition flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                Añadir imagen/video
              </button>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || (content.trim() === "" && !mediaFile)}
              className={`px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-full font-semibold transition dark:bg-blue-600 dark:hover:bg-blue-700 flex items-center ${
                isLoading || (content.trim() === "" && !mediaFile)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publicando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                  Publicar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 