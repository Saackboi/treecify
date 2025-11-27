
export default function LinksTab({ links, loading, handleDelete }) {
    return (
        /* Lista de Links Actuales */
        <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Tus Links Activos</h3>
            <div className="space-y-3 mb-10">
                {loading ? (
                    <div className="flex gap-2 m-3 justify-center">
                        <span className="size-3 animate-ping rounded-full bg-indigo-600 dark:bg-indigo-300"></span>
                        <span className="size-3 animate-ping rounded-full bg-indigo-600 [animation-delay:0.2s] dark:bg-indigo-300"></span>
                        <span className="size-3 animate-ping rounded-full bg-indigo-600 [animation-delay:0.4s] dark:bg-indigo-300"></span>
                    </div>
                ) : links.map(link => (
                    <div key={link.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer group">
                        <div className="flex items-center gap-3">
                            {/* Círculo decorativo */}
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            <div>
                                <p className="font-semibold text-slate-700 group-hover:text-indigo-600 transition">{link.title}</p>
                                <p className="text-xs text-slate-400 truncate w-40">{link.url}</p>
                            </div>
                        </div>
                        <div className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                            {link.clicks} 👁️
                        </div>
                        <div>
                            <button
                                onClick={() => handleDelete(link.id)}
                                className="text-xs font-mono text-white bg-red-500 px-2 py-1 rounded-md border border-red-600 hover:bg-red-600 transition shadow-sm active:scale-95"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </div>

    )
}
