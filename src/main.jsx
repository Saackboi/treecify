import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import PageRender from './pages/PageRender.jsx'
import PageLogin from './pages/PageLogin.jsx'
import PageRegister from './pages/PageRegister.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* RUTA DE LA VISTA LOGIN */}
        <Route path="/login" element={<PageLogin />}></Route>

        {/* RUTA DE LA VISTA REGISTER */}
        <Route path="/register" element={<PageRegister />}></Route>

        {/* RUTA DEL ADMIN PANEL */}
        <Route path="/" element={<App />}></Route>

        {/* RUTA DE LA VISTA PUBLICA */}
        <Route path="/u/:username" element={<PageRender />}></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
