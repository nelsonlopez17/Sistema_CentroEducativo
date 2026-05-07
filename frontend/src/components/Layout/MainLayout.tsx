import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaBars } from 'react-icons/fa';
import Sidebar from '../Sidebar/Sidebar';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import { useAuth } from '../../store/useAuth';
import './MainLayout.css';


const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`main-layout-container ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
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
              title={sidebarOpen ? "Colapsar menú" : "Expandir menú"}
            >
              <FaBars />
            </button>

            <div className="breadcrumb-wrapper">
              <Breadcrumb />
            </div>
          </div>
          
          <div className="header-right">
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{user?.first_name} {user?.last_name}</span>
                <span className="user-role">{user?.roles?.[0] || 'Usuario'}</span>
              </div>
              <div className="user-avatar">
                {user?.first_name?.charAt(0) || 'U'}
              </div>
            </div>
            <div className="divider"></div>
            <button className="btn-logout-icon" onClick={handleLogout} title="Cerrar Sesión">
              <FaSignOutAlt />
            </button>

          </div>
        </header>

        {/* Área donde se renderizan las páginas específicas */}
        <main className="page-content-area">
          <div className="page-header-shadow"></div>
          <div className="page-inner-content">
            <Outlet />
          </div>
        </main>

        {/* Footer Global */}
        <footer className="global-footer">
          <div className="footer-content">
            <p>&copy; 2026 <span>INBACOOP</span> | Plataforma de Gestión Académica</p>
            <div className="footer-links">
              <span>v0.1.0-alpha</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;

