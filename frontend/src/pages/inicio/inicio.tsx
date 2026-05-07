import React from 'react';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import { 
  FaUserGraduate, 
  FaChartLine, 
  FaLayerGroup, 
  FaCalendarAlt, 
  FaUserShield,
  FaChalkboardTeacher,
  FaClipboardList,
  FaNetworkWired
} from 'react-icons/fa';

import { useAuth } from '../../store/useAuth';
import './inicio.css';

interface DashboardCardInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  colorClass: string;
  allowedRoles?: string[];
}

const Inicio: React.FC = () => {
  const { user } = useAuth();

  const dashboardCards: DashboardCardInfo[] = [
    {
      title: 'Gestión de Alumnos',
      description: 'Buscar, filtrar y ver el listado completo de alumnos matriculados.',
      icon: <FaUserGraduate />,
      route: '/gestion-alumnos',
      colorClass: 'color-blue',
      allowedRoles: ['Admin']
    },
    {
      title: 'Docentes',
      description: 'Administración del personal académico y sus datos.',
      icon: <FaChalkboardTeacher />,
      route: '/docentes',
      colorClass: 'color-purple',
      allowedRoles: ['Admin']
    },
    {
      title: 'Calificaciones',
      description: 'Ingreso y visualización de notas por unidad académica.',
      icon: <FaChartLine />,
      route: '/calificaciones',
      colorClass: 'color-green',
      allowedRoles: ['Admin', 'Docente']
    },
    {
      title: 'Recuperaciones',
      description: 'Gestión de exámenes de mejoramiento y notas finales.',
      icon: <FaNetworkWired />,
      route: '/recuperaciones',
      colorClass: 'color-teal',
      allowedRoles: ['Admin', 'Docente']
    },
    {
      title: 'Inscripciones',
      description: 'Proceso de asignación de alumnos a grados y secciones.',
      icon: <FaClipboardList />,
      route: '/inscripciones',
      colorClass: 'color-cyan',
      allowedRoles: ['Admin']
    },
    {
      title: 'Ciclo Escolar Activo',
      description: 'Gestión de fechas importantes y unidades del año lectivo.',
      icon: <FaCalendarAlt />,
      route: '/ciclos-unidades',
      colorClass: 'color-orange',
      allowedRoles: ['Admin']
    },
    {
      title: 'Sistema de Usuarios',
      description: 'Control de accesos, roles y permisos de la plataforma.',
      icon: <FaUserShield />,
      route: '/usuarios',
      colorClass: 'color-indigo',
      allowedRoles: ['Admin']
    }
  ];

  return (
    <>
      <div className="main-header">
        <h1>Bienvenido al Dashboard</h1>
        <p>Selecciona un módulo para comenzar a gestionar los registros educativos.</p>
      </div>
      
      <div className="dashboard-grid">
        {dashboardCards
          .filter(card => {
            if (!card.allowedRoles) return true;
            if (!user || !user.roles) return false;
            return user.roles.some(role => 
              card.allowedRoles?.some(allowed => allowed.toLowerCase() === role.toLowerCase())
            );
          })
          .map((card, index) => (
            <DashboardCard 
              key={index}
              title={card.title}
              description={card.description}
              icon={card.icon}
              route={card.route}
              colorClass={card.colorClass}
            />
          ))}
      </div>

    </>
  );
};

export default Inicio;