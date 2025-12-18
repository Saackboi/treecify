import { useEffect, useState } from 'react'
import { PRESET_THEMES } from '../../data/theme';

export default function DesignPanel({ profile, onSave }) {
    //ESTADO LOCAL PARA GUARDAR SIN SUBIR A LA BD
    const [formData, setFormData] = useState(profile)

    //Sincronizar si cambia la configuracion externamente
    useEffect(() => {
        setFormData(profile)
    }, [profile])

    const applyTheme = (theme) => {
        setFormData({
            ...formData,
            bg_color: theme.bg_color,
            btn_color: theme.btn_color,
            text_color: theme.text_color
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <div className="h-full p-6 m-3"> {/* Quitamos estilos de tarjeta porque ya está dentro de LeftPanel */}
            <h2 className="text-xl font-bold text-gray-800 mb-6">Apariencia</h2>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* BIOGRAFÍA */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Biografía</label>
                    <textarea
                        name="bio"
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                        placeholder="Cuéntanos sobre ti..."
                        value={formData.bio || ''}
                        onChange={handleChange}
                    />
                </div>

                {/* --- SECCIÓN: TEMAS RÁPIDOS --- */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Temas</label>
                    <div className="grid grid-cols-4 gap-3">
                        {PRESET_THEMES.map((theme) => (
                            <button
                                key={theme.id}
                                type="button"
                                onClick={() => applyTheme(theme)}
                                className="group relative w-full aspect-square rounded-xl border border-gray-200 shadow-sm hover:scale-105 transition-all focus:ring-2 focus:ring-indigo-500 overflow-hidden"
                                title={theme.name}
                            >
                                {/* Fondo del tema */}
                                <div
                                    className="absolute inset-0"
                                    style={{ backgroundColor: theme.bg_color }}
                                />

                                {/* Botón miniatura dentro del tema para previsualizar contraste */}
                                <div
                                    className="absolute bottom-2 right-2 w-4 h-4 rounded-full shadow-sm"
                                    style={{ backgroundColor: theme.btn_color }}
                                />

                                {/* Tooltip casero (opcional, solo visual) */}
                                <span className="sr-only">{theme.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* --- SECCIÓN: PERSONALIZACIÓN MANUAL --- */}
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700">Ajuste Fino</label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Fondo */}
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Fondo</label>
                            <div className="flex items-center gap-2 border p-2 rounded-lg bg-gray-50">
                                <input
                                    type="color"
                                    name="bg_color"
                                    value={formData.bg_color || '#ffffff'}
                                    onChange={handleChange}
                                    className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0"
                                />
                                <span className="text-xs font-mono text-gray-500 uppercase">{formData.bg_color}</span>
                            </div>
                        </div>

                        {/* Botones */}
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Botones</label>
                            <div className="flex items-center gap-2 border p-2 rounded-lg bg-gray-50">
                                <input
                                    type="color"
                                    name="btn_color"
                                    value={formData.btn_color || '#000000'}
                                    onChange={handleChange}
                                    className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0"
                                />
                                <span className="text-xs font-mono text-gray-500 uppercase">{formData.btn_color}</span>
                            </div>
                        </div>

                        {/* Texto Botón */}
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Texto Botón</label>
                            <div className="flex items-center gap-2 border p-2 rounded-lg bg-gray-50">
                                <input
                                    type="color"
                                    name="text_color"
                                    value={formData.text_color || '#ffffff'}
                                    onChange={handleChange}
                                    className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0"
                                />
                                <span className="text-xs font-mono text-gray-500 uppercase">{formData.text_color}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-md hover:shadow-lg transform active:scale-95"
                >
                    Guardar Cambios
                </button>
            </form>
            <div className="h-20 w-full bg-transparent"></div>
        </div>

    )
}
