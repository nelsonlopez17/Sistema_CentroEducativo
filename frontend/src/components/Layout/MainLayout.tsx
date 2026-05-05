import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="main-layout-container">
      {/* Sidebar Permanente */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenido Principal (Header + Outlet) */}
      <div className="main-layout-content">
        
        {/* Header Superior Global */}
        <header className="global-header">
          <div className="header-left">
            <button 
              className="btn-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <Breadcrumb />
          </div>
          <div className="header-right">
            <span className="ciclo-info">Ciclo Escolar 2026</span>
            <button className="btn-logout" onClick={handleLogout}>Cerrar Sesión</button>
          </div>
        </header>

        {/* Área donde se renderizan las páginas específicas (Inicio, Alumnos, etc.) */}
        <main className="page-content-area">
          <Outlet />
        </main>

        {/* Footer Global */}
        <footer className="global-footer">
          <p>Plataforma de Control Académico | INBACOOP v0.1</p>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
