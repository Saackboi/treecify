import { useState, useEffect } from 'react'
import PreviewPanel from './components/RightPanel/PreviewPanel'
import FormPanel from './components/LeftPanel/FormPanel'
import swal from './utils/alerts' //esta es una clase personalizada

function App() {

  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Hook de efecto para cargar datos al montar el componente
  useEffect(() => {
    fetch('/api/links')
      .then(response => {
        if (!response.ok) throw new Error("Error al conectar con el servidor")
        return response.json()
      })
      .then(data => {
        setLinks(data.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError("No pudimos cargar tus links.")
        setLoading(false)
      })
  }, [])

  //Función para manejar el envío del form
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title || !url) return swal.fire({
      title: 'Aviso',
      icon: 'error',
      text: 'Faltan datos por llenar.',
      toast: true,
    })

    setIsCreating(true) //Activamos el estado de carga

    try {
      const response = await fetch("/api/links", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, url }) //Convertir los datos a texto
      })

      const data = await response.json()

      if (data.success) {
        //Agregamos el nuevo link a la lista existente
        setLinks([...links, data.data])

        //Limpiamos campos
        setTitle("")
        setUrl("")
      }
    } catch (error) {
      console.error("Error creando link: ", error)
      alert("Error al conectar con el servidor")
    } finally {
      setIsCreating(false) //Quitamos el estado de carga
    }
  }

  // Función para eliminar
  const handleDelete = (id) => {
    // 1. Preguntar por seguridad

    swal.fire({
      title: "¿Seguro que quieres eliminar este link?",
      text: "No podrás recuperarlo!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar!",
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        swal.fire({
          title: "Eliminado!",
          text: "El enlace se ha eliminado.",
          icon: "success",
          showConfirmButton: false,
          toast: true,
          timer: 1100,
        });

        try {
          // 2. Avisar al servidor
          const response = await fetch(`/api/links/${id}`, {
            method: 'DELETE',
          });
          const data = await response.json();

          if (data.success) {
            // 3. Actualizar la UI filtrando el link eliminado
            // "Dame todos los links cuyo ID NO SEA el que acabo de borrar"
            const newLinks = links.filter(link => link.id !== id);
            setLinks(newLinks);

            swal.fire
          }
        } catch (error) {
          console.error("Error al eliminar:", error);
        }
      }
    });
  };

  return (
    // CONTENEDOR PRINCIPAL:
    // 'min-h-screen': Ocupa toda la altura de la pantalla.
    // 'flex-col md:flex-row': En móvil es columna (uno bajo otro), en PC es fila (lado a lado).
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
          handleDelete={handleDelete}
          isCreating={isCreating}   // Para FormInputs 
        />

        {/* --- DERECHA: PREVIEW EN VIVO (Móvil) --- */}
        <PreviewPanel links={links} />
        {/* --- ENVIANDO links PARA ALCANCE --- */}

      </div>


    </>
  )
}

export default App
