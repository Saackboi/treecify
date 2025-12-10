import QRGen from "./QRGen";


export default function FormInputs({ title, setTitle, url, setUrl, handleSubmit, isCreating }) {
    const origin = window.location.origin;
    const user = JSON.parse(localStorage.getItem('user'));
    const username = user?.username || 'usuario';

    // Genera la URL dinámica
    const profileUrl = `${window.location.origin}/u/${username}`;
    return (
        <>

            {/* Header */}
            <header className="mb-8" >
                <h1 className="text-4xl font-bold text-indigo-600 mb-2 tracking-tight">Treecify</h1>
                <p className="text-slate-500 text-lg">Crea tu identidad digital en segundos.</p>
            </header >

            {/* QR Principal */}
            <QRGen url={`${profileUrl}`} />

            {/* Formulario (Visual por ahora) */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8" >
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Agregar Nuevo Link</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                            <input
                                type="text"
                                placeholder="Ej. Ver Menú PDF"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">URL Destino</label>
                            <input
                                type="text"
                                placeholder="https://..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white" />
                        </div>

                        <button
                            type="submit"
                            disabled={isCreating}
                            className={`w-full font-bold py-3 rounded-lg shadow-lg transition transform ${isCreating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 text-white'
                                }`}>
                            {isCreating ? 'Guardando...' : '+ Crear Link'}
                        </button>
                    </div>
                </form>

                {/* Alerta de desarrollo*/}
                <div className="fixed inset-x-0 bottom-0 z-auto p-4">
                    <div className="rounded border border-gray-200 bg-gray-100 px-4 py-2 text-gray-900">
                        <p className="text-center font-medium">
                            Demo Version
                        </p>
                    </div>
                </div>
            </div >
        </>
    )
}
