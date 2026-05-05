import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ListaEstudiantes } from "../../components/ListaEstudiantes";
import { useEstudiantes } from "../../hooks/useEstudiantes";
import './gestion_alumnos.css';

interface Alumno {
  id: number;
  persona: {
    nombres: string;
    apellidos: string;
    cui: string;
    fecha_nacimiento: string;
    direccion?: string;
  };
  estado_nombre: string;
  [key: string]: any;
}

const GestionAlumnos: React.FC = () => {
  const navigate = useNavigate();
  const { estudiantes, loading, error, obtenerEstudiantes } = useEstudiantes();
  const [mostrandoAlumnos, setMostrandoAlumnos] = useState(true);

  // Cargar alumnos al montar el componente
  useEffect(() => {
    obtenerEstudiantes();
  }, []);

  const handleMostrarAlumnos = () => {
    setMostrandoAlumnos(!mostrandoAlumnos);
  };

  return (
    <div className="gestion-alumnos-container">
      <nav className="gestion-nav">
        <button className="btn-volver" onClick={() => navigate('/inicio')}>
          ← Volver
        </button>
        <h1>Gestión de Alumnos</h1>
        <div></div>
      </nav>

      <main className="gestion-main">
        <div className="gestion-header">
          <h2>Alumnos Registrados ({estudiantes.length})</h2>
          <button 
            className="btn-mostrar" 
            onClick={handleMostrarAlumnos}
            disabled={loading}
          >
            {loading ? 'Cargando...' : (mostrandoAlumnos ? 'Ocultar' : 'Mostrar')} Alumnos
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <ListaEstudiantes mostrandoEstudiantes={mostrandoAlumnos} />
      </main>
    </div>
  );
};

export default GestionAlumnos;