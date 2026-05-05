import React from 'react';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import { 
  FaUserGraduate, 
  FaChartLine, 
  FaLayerGroup, 
  FaCalendarAlt, 
  FaUserShield 
} from 'react-icons/fa';
import './inicio.css';

const Inicio: React.FC = () => {
  const dashboardCards = [
    {
      title: 'Gestión de Alumnos',
      description: 'Buscar, filtrar y ver el listado completo de alumnos matriculados.',
      icon: <FaUserGraduate />,
      route: '/gestion-alumnos',
      colorClass: 'color-blue'
    },
    {
      title: 'Calificaciones',
      description: 'Ingreso y visualización de notas por unidad académica.',
      icon: <FaChartLine />,
      route: '#',
      colorClass: 'color-green'
    },
    {
      title: 'Grados y Secciones',
      description: 'Configuración y asignación de salones de clase.',
      icon: <FaLayerGroup />,
      route: '#',
      colorClass: 'color-purple'
    },
    {
      title: 'Ciclo Escolar Activo',
      description: 'Gestión de fechas importantes y unidades del año lectivo.',
      icon: <FaCalendarAlt />,
      route: '#',
      colorClass: 'color-orange'
    },
    {
      title: 'Sistema de Usuarios',
      description: 'Control de accesos, roles y permisos de la plataforma.',
      icon: <FaUserShield />,
      route: '/usuarios',
      colorClass: 'color-indigo'
    }
  ];

  return (
    <>
      <div className="main-header">
        <h1>Bienvenido al Dashboard</h1>
        <p>Selecciona un módulo para comenzar a gestionar los registros educativos.</p>
      </div>
      
      <div className="dashboard-grid">
        {dashboardCards.map((card, index) => (
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