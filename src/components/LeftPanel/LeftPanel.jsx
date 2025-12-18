import { useState } from 'react';
import FormPanel from './FormPanel';
import DesignPanel from './DesignPanel';

export default function LeftPanel({

    links, loading, title, setTitle, url, setUrl, handleSubmit, handleDelete, isCreating, // Props para FormPanel
    profile, updateProfile, handleLogout // Props para DesignPanel y Logout
}) {

    const [activeTab, setActiveTab] = useState('links');

    return (


        /* CONTENEDOR QUE OCUPA EL 50% */
        <div className="w-full md:w-1/2 bg-white flex flex-col h-screen shadow-xl z-20 relative pb24">

            {/* Header */}
            <header className="mb-3 m-5" >
                <h1 className="text-3xl font-bold text-indigo-600 mb-2 tracking-tight">Treecify</h1>
                <p className="text-slate-500 text-lg">Crea tu identidad digital en segundos.</p>
            </header >

            {/* 1. TABS (PESTAÑAS)*/}
            <div className="flex border-b border-gray-100 bg-white sticky top-0 z-30">
                <button
                    onClick={() => setActiveTab('links')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'links' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/10' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Enlaces
                </button>
                <button
                    onClick={() => setActiveTab('design')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'design' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/10' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Apariencia
                </button>
            </div>

            {/* 2. CONTENIDO SCROLLABLE */}
            <div className="flex-1 overflow-y-auto bg-white">
                {activeTab === 'links' ? (
                    <FormPanel
                        links={links} loading={loading}
                        title={title} setTitle={setTitle}
                        url={url} setUrl={setUrl}
                        handleSubmit={handleSubmit} handleDelete={handleDelete}
                        isCreating={isCreating}
                    />
                ) : (
                    <DesignPanel profile={profile} onSave={updateProfile} />
                )}
            </div>

            {/* BOTÓN LOGOUT (Flotante dentro de este panel) */}
            <button
                onClick={handleLogout}
                className="absolute top-4 right-4 z-50 text-xs font-bold text-red-500 hover:bg-red-700 hover:text-white bg-white/80 px-5 py-2 rounded border border-red-100"
            >
                Salir
            </button>
        </div>
    );
}