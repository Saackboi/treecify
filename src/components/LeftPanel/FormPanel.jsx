import FormInputs from './FormInputs'
import LinksTab from './LinksTab'

export default function FormPanel({ links, loading, title, setTitle, url, setUrl, handleSubmit, handleDelete, isCreating }) {
    return (
        /* --- IZQUIERDA: PANEL DE ADMINISTRACIÓN --- */
        <section className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-white z-10 shadow-xl">
            <div className="max-w-md mx-auto w-full">

                {/* Header y Formulario */}
                <FormInputs
                    title={title}
                    setTitle={setTitle}
                    url={url}
                    setUrl={setUrl}
                    handleSubmit={handleSubmit}
                    isCreating={isCreating} />

                {/* Lista de Links Actuales */}
                <LinksTab links={links} loading={loading} handleDelete={handleDelete} />

            </div>
        </section>
    )
}
