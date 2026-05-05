import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './inicio.css';

const Inicio: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    // Limpiar localStorage si hay token guardado
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    {
      id: 1,
      title: 'Gestión de alumnos',
      description: 'Administración de Grados, Secciones y Cursos',
      icon: '👥',
      route: '/gestion-alumnos'
    },
    {
      id: 2,
      title: 'Sistema de Usuarios',
      description: 'Control de Maestros y Estudiantes',
      icon: '👤',
      route: '/usuarios'
    },
    {
      id: 3,
      title: 'Inscripciones',
      description: 'Registro de nuevos estudiantes',
      icon: '📝',
      route: '#'
    },
    {
      id: 4,
      title: 'Calificaciones',
      description: 'Gestión de notas y promedios',
      icon: '📊',
      route: '#'
    }
  ];

  return (
    <div className="inicio-container">
      {/* Navbar */}
      <nav className="inicio-nav">
        <div className="nav-left">
          <button 
            className="btn-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="logo">INBACOOP "EL PROGRESO"</div>
        </div>
        <div className="nav-right">
          <span className="ciclo-info">Ciclo Escolar 2026</span>
          <button className="btn-logout" onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </nav>

      {/* Main Layout con Sidebar */}
      <div className="inicio-layout">
        {/* Sidebar */}
        <aside className={`inicio-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <h2>Menú</h2>
            <button 
              className="btn-close-sidebar"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>
          <nav className="sidebar-menu">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className="menu-item"
                onClick={() => item.route !== '#' && navigate(item.route)}
              >
                <span className="menu-icon">{item.icon}</span>
                <div className="menu-content">
                  <div className="menu-title">{item.title}</div>
                  <div className="menu-desc">{item.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="inicio-main">
          <div className="main-header">
            <h1>Bienvenido</h1>
            <p>Gestión y administración de registros educativos, asignaciones y control de notas.</p>
          </div>
          <div className="main-content">
            {/* Espacio reservado para contenido futuro */}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="inicio-footer">
        <p>Plataforma de Control Académico | v0.1</p>
      </footer>
    </div>
  );
};

export default Inicio;