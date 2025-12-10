import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Usamos Link para navegación interna SPA
import MySwal from '../utils/alerts'; // Tu sistema de alertas personalizado

export default function PageRegister() {

    const navigate = useNavigate();

    //AVISO PARA DEMO
    useEffect(() => {
        MySwal.fire({
            title: 'Aplicación de Demostración',
            html: `
                <p>Esta instancia es una prueba de la aplicación.</p>
                <br/>
                <p>Por tu seguridad, <b>NO utilices contraseñas reales</b> que uses en otros sitios (como Gmail, Facebook, o Bancos).</p>
                <p>Puedes utilizar datos ficticios o contraseñas simples (ej: 123456).</p>
            `,
            icon: 'info',
            confirmButtonText: 'Entendido, usaré datos de prueba',
            allowOutsideClick: false,
            allowEscapeKey: false
        });
    }, []);

    // 1. Estado para guardar los datos del formulario
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);

    // 2. Función que actualiza el estado al escribir
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // 3. Función de Envío
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación local básica
        if (formData.password !== formData.confirmPassword) {
            return MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Las contraseñas no coinciden.'
            });
        }

        setLoading(true);

        try {
            // Llamada al Backend
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (data.success) {
                // Guardamos el token
                localStorage.setItem('token', data.token);
                // Guardamos info básica del usuario (opcional)
                localStorage.setItem('user', JSON.stringify(data.user));

                await MySwal.fire({
                    icon: 'success',
                    title: '¡Bienvenido a Treecify!',
                    text: 'Tu cuenta ha sido creada exitosamente.',
                    timer: 2000,
                    showConfirmButton: false
                });

                // Redirigir al Dashboard
                navigate('/');
            } else {
                MySwal.fire({
                    icon: 'error',
                    title: 'Error de registro',
                    text: data.message || 'Hubo un problema al crear la cuenta.'
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
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img src="./treecify_icon.svg" alt="Your Company" className="mx-auto h-10 w-auto" />
                <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Crear cuenta</h2>
            </div>
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">Usuario</label>
                        <div className="mt-2">
                            <input
                                placeholder='Ingresa un nombre de usuario'
                                id="username"
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                autoComplete="username"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
                        </div>

                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">Correo electrónico</label>
                        <div className="mt-2">
                            <input
                                placeholder='Ingresa tu correo electrónico'
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
                        </div>

                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">Contraseña</label>
                        </div>
                        <div className="mt-2">
                            <input placeholder='Ingresa tu contraseña'
                                id="password"
                                type="password"
                                name="password"
                                required
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">Confirmar contraseña</label>
                        </div>
                        <div className="mt-2">
                            <input placeholder='Vuelve a ingresar tu contraseña'
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                required
                                autoComplete="current-password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Creando cuenta...' : 'Acceder'}
                        </button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm/6 text-gray-500">
                    Estás registrado?
                    <a href="./login" className="font-semibold text-indigo-600 hover:text-indigo-500"> Iniciar sesión</a>
                </p>
            </div>
        </div>
    )
}
