import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';
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
  allowedRoles?: string[];
}

interface MenuGroup {
  groupName: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    groupName: 'Panel de Administración',
    items: [
      { title: 'Usuarios del Sistema', icon: <FaUserShield />, route: '/usuarios', allowedRoles: ['Admin'] },
      { title: 'Gestión de Docentes', icon: <FaChalkboardTeacher />, route: '/docentes', allowedRoles: ['Admin'] },
      { title: 'Registro de Alumnos', icon: <FaUserGraduate />, route: '/gestion-alumnos', allowedRoles: ['Admin'] },
      { title: 'Ciclos y Unidades', icon: <FaCalendarAlt />, route: '/ciclos-unidades', allowedRoles: ['Admin'] },
      { title: 'Auditoría', icon: <FaHistory />, route: '/auditoria', allowedRoles: ['Admin'] }
    ]
  },
  {
    groupName: 'Configuración Académica',
    items: [
      { title: 'Grados y Secciones', icon: <FaLayerGroup />, route: '/grados-secciones', allowedRoles: ['Admin'] },
      { title: 'Cursos y Pensum', icon: <FaBook />, route: '/cursos-pensum', allowedRoles: ['Admin'] },
      { title: 'Inscripciones', icon: <FaClipboardList />, route: '/inscripciones', allowedRoles: ['Admin'] },
      { title: 'Asignaciones', icon: <FaNetworkWired />, route: '/asignaciones', allowedRoles: ['Admin'] }
    ]
  },
  {
    groupName: 'Control de Notas',
    items: [
      { title: 'Calificaciones', icon: <FaChartLine />, route: '/calificaciones', allowedRoles: ['Admin', 'Docente'] },
      { title: 'Recuperaciones', icon: <FaBriefcaseMedical />, route: '/recuperaciones', allowedRoles: ['Admin', 'Docente'] }
    ]
  }
];



const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const filteredGroups = useMemo(() => {

    const filtered = menuGroups.map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (!item.allowedRoles) return true;
        if (!user || !user.roles) return false;
        
        // Comparación insensible a mayúsculas
        const hasRole = user.roles.some(role => 
          item.allowedRoles?.some(allowed => allowed.toLowerCase() === role.toLowerCase())
        );
        
        return hasRole;
      })
    })).filter(group => group.items.length > 0);
    
    return filtered;
  }, [user]);



  return (
    <aside className={`custom-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>Menú Principal</h2>
        <button className="btn-close-sidebar" onClick={onClose}>✕</button>
      </div>
      <nav className="sidebar-content">
        {filteredGroups.map((group, index) => (
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
