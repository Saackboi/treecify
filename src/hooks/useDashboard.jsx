
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MySwal from '../utils/alerts';

export function useDashboard() {
    const navigate = useNavigate();
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Obtenemos el token al inicio
    const token = localStorage.getItem('token');

    // --- 1. LÓGICA DE LOGOUT ---
    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    }, [navigate]);

    // --- 2. LÓGICA DE CARGA (GET) ---
    // Usamos useCallback para que no se re-cree infinitamente en el useEffect
    const loadLinks = useCallback(async () => {
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const res = await fetch('/api/links', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            // Si el token expiró (401), cerramos sesión
            if (res.status === 401) {
                handleLogout();
                return;
            }

            if (!res.ok) throw new Error("Error al conectar con el servidor");

            const data = await res.json();
            // Aseguramos que sea un array
            setLinks(Array.isArray(data.data) ? data.data : []);

        } catch (error) {
            console.error(error);
            MySwal.fire("Error", "No pudimos cargar tus links.", "error");
        } finally {
            setLoading(false);
        }
    }, [token, navigate, handleLogout]);

    // --- 3. LÓGICA DE CREAR (POST) ---
    const createLink = async (title, url) => {
        if (!token) return handleLogout();

        // Retornaremos 'true' si fue exitoso para que el UI limpie los inputs
        try {
            const response = await fetch("/api/links", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, url })
            });

            if (response.status === 401) {
                handleLogout();
                return false;
            }

            const data = await response.json();

            if (data.success) {
                // Actualización optimista del estado
                setLinks(prevLinks => [...prevLinks, data.data]);

                // Feedback visual
                MySwal.fire({
                    icon: 'success',
                    title: 'Creado',
                    toast: true,
                    timer: 1500,
                    showConfirmButton: false
                });
                return true; // Éxito
            } else {
                MySwal.fire("Error", data.message || "No se pudo crear", "error");
                return false;
            }

        } catch (error) {
            console.error("Error creando link: ", error);
            MySwal.fire("Error", "Error de conexión", "error");
            return false;
        }
    };

    // --- 4. LÓGICA DE BORRAR (DELETE) ---
    const deleteLink = async (id) => {
        if (!token) return handleLogout();

        // Primero la confirmación visual
        const result = await MySwal.fire({
            title: "¿Seguro que quieres eliminar este link?",
            text: "¡No podrás recuperarlo!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar!",
            cancelButtonText: 'Cancelar',
        });

        // Si el usuario confirma, procedemos
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/links/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401) {
                    handleLogout();
                    return;
                }

                const data = await response.json();

                if (data.success) {
                    // Actualización del estado (filtramos el borrado)
                    setLinks(prevLinks => prevLinks.filter(link => link.id !== id));

                    MySwal.fire({
                        title: "¡Eliminado!",
                        text: "El enlace se ha eliminado.",
                        icon: "success",
                        showConfirmButton: false,
                        toast: true,
                        timer: 1100,
                    });
                } else {
                    MySwal.fire("Error", "No se pudo eliminar", "error");
                }
            } catch (error) {
                console.error("Error al eliminar:", error);
                MySwal.fire("Error", "Error de conexión", "error");
            }
        }
    };

    // Ejecutamos la carga inicial
    useEffect(() => {
        loadLinks();
    }, [loadLinks]);

    // Retornamos todo lo que el componente App necesita
    return {
        links,
        loading,
        createLink,
        deleteLink,
        handleLogout
    };
}