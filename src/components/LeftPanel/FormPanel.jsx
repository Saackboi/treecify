
import FormInputs from './FormInputs'
import LinksTab from './LinksTab'

export default function FormPanel({ links, loading, title, setTitle, url, setUrl, handleSubmit, handleDelete, isCreating }) {
    return (
        /* --- IZQUIERDA: PANEL DE ADMINISTRACIÓN --- */
        <section className="w-full h-full p-8 flex flex-col items-center">
            <div className="w-full p-7">

                {/*Formulario */}
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
