import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaHome, FaChevronRight } from 'react-icons/fa';
import './Breadcrumb.css';

// Diccionario para mapear las rutas a nombres de módulos y grupos legibles
const routeMap: Record<string, { group: string, name: string }> = {
  '/inicio': { group: 'Dashboard', name: 'Resumen' },
  '/gestion-alumnos': { group: 'Gestión de Personas', name: 'Alumnos' },
  '/usuarios': { group: 'Gestión de Personas', name: 'Usuarios' },
  '/docentes': { group: 'Gestión de Personas', name: 'Docentes' },
};

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Si estamos en la raíz o en una ruta no mapeada, no mostramos el grupo, solo el path
  const mapping = routeMap[currentPath];

  return (
    <div className="breadcrumb-container">
      <Link to="/inicio" className="breadcrumb-link home-icon">
        <FaHome />
      </Link>
      
      {mapping ? (
        <>
          <FaChevronRight className="breadcrumb-separator" />
          <span className="breadcrumb-group">{mapping.group}</span>
          <FaChevronRight className="breadcrumb-separator" />
          <span className="breadcrumb-current">{mapping.name}</span>
        </>
      ) : (
        currentPath !== '/inicio' && (
          <>
            <FaChevronRight className="breadcrumb-separator" />
            <span className="breadcrumb-current">{currentPath.replace('/', '')}</span>
          </>
        )
      )}
    </div>
  );
};

export default Breadcrumb;
