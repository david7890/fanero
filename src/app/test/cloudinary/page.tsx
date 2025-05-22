"use client";

import { useState, useRef } from 'react';
import Header from '@/app/components/Header';

export default function CloudinaryTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error' | null>(null);
  const [connectionData, setConnectionData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Verificar la conexión con Cloudinary
  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      setConnectionData(null);
      setError(null);
      
      const response = await fetch('/api/test/cloudinary');
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
        setError(data.error || 'Error desconocido al conectar con Cloudinary');
      }
      
      setConnectionData(data);
    } catch (err: any) {
      setConnectionStatus('error');
      setError(err.message || 'Error al verificar la conexión');
      console.error('Error al verificar conexión con Cloudinary:', err);
    }
  };

  // Manejar selección de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setResult(null);
    
    if (selectedFile) {
      // Verificar si es un video
      setIsVideo(selectedFile.type.startsWith('video/'));
      
      // Crear previsualización
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  };

  // Enviar archivo a Cloudinary
  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo primero');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/test/cloudinary', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Error al subir el archivo');
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
      console.error('Error al subir archivo a Cloudinary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary dark:bg-gray-900">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 pt-[90px] pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Prueba de integración con Cloudinary
          </h1>
          
          {/* Probar conexión */}
          <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              1. Verificar conexión
            </h2>
            
            <button
              onClick={checkConnection}
              disabled={connectionStatus === 'checking'}
              className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-md font-medium transition shadow-md dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50"
            >
              {connectionStatus === 'checking' ? 'Verificando...' : 'Verificar conexión'}
            </button>
            
            {connectionStatus === 'connected' && (
              <div className="mt-4 p-3 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-md">
                <p className="font-medium">✅ Conexión establecida correctamente</p>
                <p className="text-sm mt-1">Cloud name: {connectionData?.cloudName}</p>
              </div>
            )}
            
            {connectionStatus === 'error' && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-md">
                <p className="font-medium">❌ Error de conexión</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}
          </div>
          
          {/* Probar subida de archivos */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              2. Probar subida de archivos
            </h2>
            
            <div className="mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md font-medium transition flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Seleccionar archivo
              </button>
              
              {file && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Archivo seleccionado: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>
            
            {/* Previsualización */}
            {previewUrl && (
              <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 p-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Vista previa:</p>
                {isVideo ? (
                  <video
                    src={previewUrl}
                    controls
                    className="max-h-64 mx-auto"
                  ></video>
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-64 mx-auto object-contain"
                  />
                )}
              </div>
            )}
            
            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleUpload}
                disabled={!file || isLoading}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-md font-medium transition shadow-md dark:bg-blue-600 dark:hover:bg-blue-700 flex items-center disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Subiendo...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Subir a Cloudinary
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-md">
                <p className="font-medium">Error:</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {result && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Resultado de la subida:</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Información del archivo:</p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li><span className="font-medium">Nombre:</span> {result.file.name}</li>
                      <li><span className="font-medium">Tipo:</span> {result.file.type}</li>
                      <li><span className="font-medium">Tamaño:</span> {(result.file.size / 1024).toFixed(2)} KB</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Información de Cloudinary:</p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li><span className="font-medium">URL:</span> <a href={result.cloudinary.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">{result.cloudinary.url}</a></li>
                      <li><span className="font-medium">ID Público:</span> {result.cloudinary.publicId}</li>
                      <li><span className="font-medium">Formato:</span> {result.cloudinary.format}</li>
                      <li><span className="font-medium">Tipo de recurso:</span> {result.cloudinary.resourceType}</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-600 rounded-md">
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Vista previa de Cloudinary:</p>
                  {result.cloudinary.resourceType === 'video' ? (
                    <video
                      src={result.cloudinary.url}
                      controls
                      className="max-h-64 mx-auto"
                    ></video>
                  ) : (
                    <img
                      src={result.cloudinary.url}
                      alt="Cloudinary Preview"
                      className="max-h-64 mx-auto object-contain"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Información adicional */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md text-sm">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Consejos para pruebas:</h3>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
              <li>Primero verifica la conexión para asegurarte que tus credenciales están correctamente configuradas.</li>
              <li>Prueba con imágenes pequeñas y grandes para verificar los límites.</li>
              <li>Prueba con diferentes formatos (JPG, PNG, GIF, WebP).</li>
              <li>Si tienes un plan que lo permita, prueba con videos cortos.</li>
              <li>Revisa en el dashboard de Cloudinary que los archivos se hayan subido correctamente.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
} 