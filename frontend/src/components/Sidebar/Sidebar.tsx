import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaUserGraduate, FaChalkboardTeacher, FaUserShield, 
  FaLayerGroup, FaBook, FaClipboardList, 
  FaNetworkWired, FaChartLine, FaBriefcaseMedical, 
  FaCalendarAlt, FaHistory 
} from 'react-icons/fa';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  route: string;
}

interface MenuGroup {
  groupName: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    groupName: 'Gestión de Personas',
    items: [
      { title: 'Alumnos', icon: <FaUserGraduate />, route: '/gestion-alumnos' },
      { title: 'Docentes', icon: <FaChalkboardTeacher />, route: '/docentes' },
      { title: 'Usuarios', icon: <FaUserShield />, route: '/usuarios' }
    ]
  },
  {
    groupName: 'Estructura Académica',
    items: [
      { title: 'Grados y Secciones', icon: <FaLayerGroup />, route: '/grados-secciones' },
      { title: 'Cursos y Pensum', icon: <FaBook />, route: '/cursos-pensum' }
    ]
  },
  {
    groupName: 'Procesos',
    items: [
      { title: 'Inscripciones', icon: <FaClipboardList />, route: '/inscripciones' },
      { title: 'Asignaciones', icon: <FaNetworkWired />, route: '/asignaciones' }
    ]
  },
  {
    groupName: 'Evaluaciones',
    items: [
      { title: 'Calificaciones', icon: <FaChartLine />, route: '/calificaciones' },
      { title: 'Recuperaciones', icon: <FaBriefcaseMedical />, route: '/recuperaciones' }
    ]
  },
  {
    groupName: 'Configuración',
    items: [
      { title: 'Ciclos y Unidades', icon: <FaCalendarAlt />, route: '/ciclos-unidades' },
      { title: 'Auditoría', icon: <FaHistory />, route: '/auditoria' }
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className={`custom-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>Menú Principal</h2>
        <button className="btn-close-sidebar" onClick={onClose}>✕</button>
      </div>
      <nav className="sidebar-content">
        {menuGroups.map((group, index) => (
          <div key={index} className="sidebar-group">
            <h3 className="group-title">{group.groupName}</h3>
            <ul className="group-items">
              {group.items.map((item, itemIdx) => {
                const isActive = location.pathname === item.route;
                return (
                  <li key={itemIdx}>
                    <button
                      className={`sidebar-item ${isActive ? 'active' : ''}`}
                      onClick={() => item.route !== '#' && navigate(item.route)}
                    >
                      <span className="item-icon">{item.icon}</span>
                      <span className="item-title">{item.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
