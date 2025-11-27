import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import PageRender from './pages/PageRender.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* RUTA DEL ADMIN PANEL */}
        <Route path="/" element={<App />}></Route>

        {/* RUTA DE LA VISTA PUBLICA */}
        <Route path="/ver" element={<PageRender />}></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
