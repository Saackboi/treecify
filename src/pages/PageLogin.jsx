import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MySwal from '../utils/alerts'; // Tu sistema de alertas

export default function PageLogin() {
    const navigate = useNavigate();

    // 1. Estados para el formulario
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    // 2. Manejador de cambios en los inputs
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // 3. Función de Login
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Petición al Backend
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // Guardamos la llave de acceso
                localStorage.setItem('token', data.token);

                // Guardamos datos del usuario para mostrar nombre/email luego
                localStorage.setItem('user', JSON.stringify(data.user));

                //
                const username = JSON.parse(JSON.stringify(data.user)).username

                // Alerta bonita
                await MySwal.fire({
                    icon: 'success',
                    title: '¡Hola de nuevo, ' + username + '!',
                    text: 'Has iniciado sesión correctamente.',
                    timer: 1500,
                    showConfirmButton: false
                });

                // Redirigir al Dashboard principal
                navigate('/');
            } else {
                //  Credenciales incorrectas
                MySwal.fire({
                    icon: 'error',
                    title: 'Acceso denegado',
                    text: data.message || 'Correo o contraseña incorrectos.'
                });
            }

        } catch (error) {
            console.error(error);
            MySwal.fire('Error', 'No se pudo conectar con el servidor', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-surface-50 min-h-screen">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                {/* Asegúrate de que la ruta de la imagen sea correcta desde public/ */}
                <img src="/treecify_icon.svg" alt="Treecify" className="mx-auto h-12 w-auto" />
                <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
                    Inicia sesión en tu cuenta
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* EMAIL */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                            Correo electrónico
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                placeholder='Ingresa tu correo electrónico'
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 transition"
                            />
                        </div>
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                                Contraseña
                            </label>
                            <div className="text-sm">
                                {/* Este link es visual por ahora, no tiene funcionalidad backend aún */}
                                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 transition">
                                    ¿Olvidó su contraseña?
                                </a>
                            </div>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                placeholder='Ingresa tu contraseña'
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 transition"
                            />
                        </div>
                    </div>

                    {/* BOTÓN SUBMIT */}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Verificando...' : 'Acceder'}
                        </button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm text-gray-500">
                    ¿No estás registrado?{' '}
                    <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 transition">
                        Crear cuenta
                    </Link>
                </p>
            </div>
        </div>
    );
}