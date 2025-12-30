
export default function PreviewPanel({ profile, links }) {

    // Asegura que el link maneje el protocolo http
    const ensureProtocol = (url) => {
        if (!url) return '#'

        //Si ya tiene http o https, lo deja igual. Si no, le agrega https://
        return url.startsWith('http') ? url : `https://${url}`
    }

    // DATOS DEL USUARIO
    const username = profile?.username || 'Usuario';
    const bio = profile?.bio || "¡Hola! Aquí tienes un ejemplo de página.";
    const bgColor = profile?.bg_color || '#f8fafc';
    const btnColor = profile?.btn_color || '#ffffff';
    const textColor = profile?.text_color || '#334155';
    const profileImg = profile?.profile_img || 'treecify_icon.svg';

    return (
        /* --- DERECHA: PREVIEW EN VIVO (Móvil) --- */
        <section className="w-full md:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-8 sticky top-0 h-screen overflow-hidden" >

            {/* MOCKUP DE TELÉFONO (El marco negro) */}
            <div className="w-[320px] h-[650px] bg-white rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden relative ring-4 ring-white/20" >

                {/* Notch (Cámara simulada) */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20" ></div >

                {/* Pantalla interna del celular */}
                <div className="h-full w-full overflow-y-auto pt-12 pb-8 px-5 flex flex-col items-center scrollbar-hide" style={{ backgroundColor: bgColor }}>

                    {/* Perfil del Usuario */}
                    <div className="w-24 h-24 bg-indigo-100 rounded-full mb-4 border-4 border-white shadow-md flex items-center justify-center text-4xl animate-bounce-slow" >
                        <img src={profileImg} alt="" className="rounded-full w-full" />
                    </div >
                    <h2 className="text-xl font-bold text-slate-800 text-center">@{username}</h2>
                    <p className="text-sm text-slate-500 mb-8 text-center leading-relaxed">
                        {bio}
                    </p>

                    {/* Renderizado de Links */}
                    <div className="w-full space-y-4">
                        {links.map(link => (
                            <a
                                key={link.id}
                                href={ensureProtocol(link.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ backgroundColor: btnColor, color: textColor }}
                                className="block w-full bg-white hover:bg-indigo-600 hover:text-white text-slate-700 font-semibold py-4 px-6 rounded-xl shadow-sm border border-slate-200 text-center transition-all duration-300 transform hover:scale-105"
                            >
                                {link.title}
                            </a>
                        ))}
                    </div>

                    {/* Footer Branding */}
                    <div className="mt-auto pt-8 opacity-60">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">Powered by Treecify</p>
                    </div>

                </div >
            </div >

            {/* Texto flotante decorativo */}
            < div className="absolute top-20 text-white/50 text-sm font-light hidden md:block" >
                Vista previa en tiempo real
            </div >

        </section >


    )
}
