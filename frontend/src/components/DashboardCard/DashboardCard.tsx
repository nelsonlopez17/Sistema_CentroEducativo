import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardCard.css';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  colorClass?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, icon, route, colorClass = 'default-color' }) => {
  const navigate = useNavigate();

  return (
    <div className={`dashboard-card ${colorClass}`} onClick={() => route !== '#' && navigate(route)}>
      <div className="card-icon-wrapper">
        {icon}
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="card-action">
        <button>Ir al módulo</button>
      </div>
    </div>
  );
};

export default DashboardCard;
