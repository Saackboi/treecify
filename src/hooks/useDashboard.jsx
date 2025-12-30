
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MySwal from '../utils/alerts';

export function useDashboard() {
    const navigate = useNavigate();
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({
        username: '',
        bio: '',
        bg_color: '#f3f4f6',
        btn_color: '#4f46e5',
        text_color: '#ffffff',
        profile_img: ''
    });

    // Obtenemos el token al inicio
    let token = localStorage.getItem('token');

    // --- 1. LÓGICA DE LOGOUT ---
    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    }, [navigate]);

    // --- 2. LÓGICA DE CARGA (GET) ---
    // --- CARGA DE DATOS (LINKS + PERFIL) ---
    const loadData = useCallback(async () => {
        if (!token) {
            handleLogout();
            return;
        }

        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            // Hacemos las dos peticiones en paralelo (más rápido)
            const [resLinks, resUser] = await Promise.all([
                fetch('/api/links', { headers }),
                fetch('/api/user/me', { headers })
            ]);

            if (resLinks.status === 401 || resUser.status === 401) {
                handleLogout();
                return;
            }

            const dataLinks = await resLinks.json();
            const dataUser = await resUser.json();

            if (dataLinks.success) setLinks(dataLinks.data);

            // 2. GUARDAMOS EL PERFIL EN EL ESTADO
            if (dataUser.success) {
                setProfile(prev => ({ ...prev, ...dataUser.data }));
            }

        } catch (error) {
            console.error(error);
            MySwal.fire("Error", "Error cargando datos", "error");
        } finally {
            setLoading(false);
        }
    }, [token, handleLogout]);


    // Ejecutamos la carga inicial
    useEffect(() => {
        loadData();
    }, [loadData]);


    // --- 3. LÓGICA DE CREAR (POST) ---
    const createLink = async (title, url) => {
        let token = localStorage.getItem('token');
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
        let token = localStorage.getItem('token');
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

    // ACTUALIZAR CONFIGURACION DE PERFIL DEL USUARIO
    const updateProfile = async (newProfileData) => {
        const token = localStorage.getItem('token');
        if (!token) return handleLogout();

        // Actualizamos estado local inmediatamente
        setProfile(newProfileData);

        try {
            const res = await fetch('/api/user/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newProfileData)
            });
            const data = await res.json();

            if (data.success) {
                MySwal.fire({ icon: 'success', title: 'Diseño guardado', toast: true, timer: 1000, showConfirmButton: false });
            }
        } catch (error) {
            console.error("Error guardando perfil:", error);
        }
    };

    // Retornamos todo lo que el componente App necesita
    return {
        links,
        profile,
        loading,
        createLink,
        deleteLink,
        handleLogout,
        updateProfile
    };
}