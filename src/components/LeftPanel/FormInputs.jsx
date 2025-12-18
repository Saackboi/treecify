import QRGen from "./QRGen";


export default function FormInputs({ title, setTitle, url, setUrl, handleSubmit, isCreating }) {
    const origin = window.location.origin;
    const user = JSON.parse(localStorage.getItem('user'));
    const username = user?.username || 'usuario';

    // Genera la URL dinámica
    const profileUrl = `${window.location.origin}/u/${username}`;
    return (
        <>

            {/* QR Principal */}
            <QRGen url={`${profileUrl}`} />

            {/* Formulario */}
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
            </div >
        </>
    )
}
