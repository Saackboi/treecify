import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PreviewPanel from './components/RightPanel/PreviewPanel'
import LeftPanel from './components/LeftPanel/LeftPanel'
import swal from './utils/alerts'
import { useDashboard } from './hooks/useDashboard';

function App() {
  // la lógica de fetchs y manejo de token
  const { links, loading, profile, createLink, deleteLink, updateProfile, handleLogout } = useDashboard();

  // Estados UI locales (solo para controlar los inputs del formulario)
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Wrapper simple para manejar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !url) return swal.fire({
      title: 'Aviso',
      icon: 'error',
      text: 'Faltan datos por llenar.',
      toast: true,
    });

    setIsCreating(true);

    // Llamamos a la función del hook. Esperamos a que nos diga si tuvo éxito (true/false)
    const success = await createLink(title, url);

    setIsCreating(false);

    // Solo si se guardó bien, limpiamos los inputs
    if (success) {
      setTitle("");
      setUrl("");
    }
  };

  if (loading) return <div className="flex gap-2 m-3 justify-center">
    <span className="size-3 animate-ping rounded-full bg-indigo-600 dark:bg-indigo-300"></span>
    <span className="size-3 animate-ping rounded-full bg-indigo-600 [animation-delay:0.2s] dark:bg-indigo-300"></span>
    <span className="size-3 animate-ping rounded-full bg-indigo-600 [animation-delay:0.4s] dark:bg-indigo-300"></span>
  </div>;

  return (
    // CONTENEDOR PRINCIPAL:
    <>

      <div className="min-h-screen flex flex-col md:flex-row font-sans">

        {/* --- IZQUIERDA: PANEL DE ADMINISTRACIÓN --- */}
        <LeftPanel
          // Props de Datos
          links={links}
          loading={loading}
          profile={profile}

          // Props de Formulario
          title={title} setTitle={setTitle}
          url={url} setUrl={setUrl}
          isCreating={isCreating}

          // Funciones
          handleSubmit={handleSubmit}
          handleDelete={deleteLink}
          updateProfile={updateProfile}
          handleLogout={handleLogout}
        />

        {/* --- DERECHA: PREVIEW EN VIVO (Móvil) --- */}
        <PreviewPanel links={links} profile={profile} />
        {/* --- ENVIANDO links PARA ALCANCE --- */}

        {/* Alerta de desarrollo*/}
        <div className="fixed inset-x-0 bottom-0 z-[9999] p-4">
          <div className="rounded border border-gray-200 bg-gray-100 px-4 py-2 text-gray-900">
            <p className="text-center font-medium">
              Demo Version
            </p>
          </div>
        </div>
      </div>


    </>
  )
}

export default App
