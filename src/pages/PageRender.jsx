import { useState, useEffect } from "react"
import { useParams } from "react-router-dom";

export default function PageRender() {

    const { username } = useParams()
    const [links, setLinks] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Llamamos a la API pública
        fetch(`/api/links/public/${username}`)
            .then(res => {
                if (!res.ok) throw new Error("Usuario no encontrado");
                return res.json();
            })
            .then(data => {
                setLinks(data.links || []);
                setProfile(data.user || {});
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(true);
                setLoading(false);
            });
    }, [username]);

    // Asegura que el link maneje el protocolo http
    const ensureProtocol = (url) => {
        if (!url) return '#'
        return url.startsWith('http') ? url : `https://${url}`
    }

    // Valores por defecto (si cargó el profile, úsalos, si no, usa los defaults)
    const bgColor = profile?.bg_color || '#f8fafc';
    const btnColor = profile?.btn_color || '#ffffff';
    const textColor = profile?.text_color || '#334155';
    const bio = profile?.bio || "¡Hola! Esto es un ejemplo de presentación.";
    const profileImg = profile?.profile_img || '../treecify_icon.svg';


    if (loading) return (
        <div className="min-h-screen flex items-center justify-center gap-2 bg-slate-50">
            <span className="size-3 animate-ping rounded-full bg-indigo-600"></span>
            <span className="size-3 animate-ping rounded-full bg-indigo-600 [animation-delay:0.2s]"></span>
            <span className="size-3 animate-ping rounded-full bg-indigo-600 [animation-delay:0.4s]"></span>
        </div>
    );

    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Usuario no encontrado 😢</div>;

    return (
        /* APLICAMOS EL COLOR DE FONDO A TODA LA PANTALLA */
        <div
            className="min-h-screen flex flex-col items-center py-10 px-4 transition-colors duration-500"
            style={{ backgroundColor: bgColor }}
        >

            {/* Perfil del Usuario */}
            <div className="w-24 h-24 bg-indigo-100 rounded-full mb-4 border-4 border-white shadow-md flex items-center justify-center text-4xl animate-bounce-slow">
                <img src={profileImg} alt="" className="rounded-full w-full" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 text-center mb-2 mix-blend-hard-light">@{username}</h2>

            <p className="text-slate-700 mb-8 text-center max-w-xs mix-blend-hard-light font-medium">
                {bio}
            </p>

            {/* Renderizado de Links */}
            <div className="w-full max-w-md space-y-4">
                {links.map(link => (
                    <a
                        key={link.id}
                        href={ensureProtocol(link.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ backgroundColor: btnColor, color: textColor }}
                        className="block w-full font-semibold py-4 px-6 rounded-xl shadow-sm 
                         text-center transition-all duration-300 transform hover:scale-105 hover:!bg-gray-400 hover:!text-white hover:!border-transparent"
                    >
                        {link.title}
                    </a>
                ))}
            </div>

            {/* Footer Branding */}
            <div className="mt-auto pt-8 opacity-60 mix-blend-hard-light">
                <p className="text-[10px] text-slate-700 uppercase tracking-widest font-bold">Creado con Treecify</p>
            </div>

        </div>
    )
} 