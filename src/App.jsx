import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PreviewPanel from './components/RightPanel/PreviewPanel'
import FormPanel from './components/LeftPanel/FormPanel'
import swal from './utils/alerts'
import { useDashboard } from './hooks/useDashboard';

function App() {
  // la lógica de fetchs y manejo de token
  const { links, loading, createLink, deleteLink, handleLogout } = useDashboard();

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

  return (
    // CONTENEDOR PRINCIPAL:
    <>

      <div className="min-h-screen flex flex-col md:flex-row font-sans">

        {/* --- IZQUIERDA: PANEL DE ADMINISTRACIÓN --- */}
        <FormPanel
          links={links}             // Para LinksTab
          loading={loading}         // Para LinksTab
          title={title}             // Para FormInputs
          setTitle={setTitle}       // Para FormInputs
          url={url}                 // Para FormInputs
          setUrl={setUrl}           // Para FormInputs
          handleSubmit={handleSubmit} // Para FormInputs
          handleDelete={deleteLink}
          isCreating={isCreating}   // Para FormInputs 
        />
        <button
          onClick={handleLogout}
          className="fixed top-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow text-xs"
        >
          Cerrar Sesión
        </button>

        {/* --- DERECHA: PREVIEW EN VIVO (Móvil) --- */}
        <PreviewPanel links={links} />
        {/* --- ENVIANDO links PARA ALCANCE --- */}


      </div>


    </>
  )
}

export default App
