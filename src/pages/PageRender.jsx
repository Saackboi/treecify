import { useState, useEffect } from "react"

export default function PageRender() {

    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Cargar los mismos datos que el admin
    useEffect(() => {
        fetch('/api/links')
            .then(res => res.json())
            .then(data => {
                setLinks(data.data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    // Asegura que el link maneje el protocolo http
    const ensureProtocol = (url) => {
        if (!url) return '#'

        //Si ya tiene http o https, lo deja igual. Si no, le agrega https://
        return url.startsWith('http') ? url : `https://${url}`
    }

    if (loading) return <div className="flex gap-2 m-3 justify-center">
        <span className="size-3 animate-ping rounded-full bg-indigo-600 dark:bg-indigo-300"></span>
        <span className="size-3 animate-ping rounded-full bg-indigo-600 [animation-delay:0.2s] dark:bg-indigo-300"></span>
        <span className="size-3 animate-ping rounded-full bg-indigo-600 [animation-delay:0.4s] dark:bg-indigo-300"></span>
    </div>;

    return (
        <>
            {/* Vista movil */}
            <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">

                {/* Perfil del Usuario */}
                < div className="w-24 h-24 bg-indigo-100 rounded-full mb-4 border-4 border-white shadow-md flex items-center justify-center text-4xl animate-bounce-slow" >
                    ⛩
                </div >
                <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">Agencia Koji</h2>
                <p className="text-slate-500 mb-8 text-center max-w-xs">
                    ¡Hola! Aquí tienes nuestros enlaces directos para proyectos y servicios.
                </p>

                {/* Renderizado de Links */}
                <div className="w-full max-w-md space-y-4">
                    {links.map(link => (
                        <a
                            key={link.id}
                            href={ensureProtocol(link.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-white hover:bg-indigo-600 hover:text-white text-slate-700 font-semibold py-4 px-6 rounded-xl shadow-sm border border-slate-200 text-center transition-all duration-300 transform hover:scale-105"
                        >
                            {link.title}
                        </a>
                    ))}
                </div>

                {/* Footer Branding */}
                <div className="mt-auto pt-8 opacity-60">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Creado con QR-Bio</p>
                </div>

            </div >
        </>
    )
}
