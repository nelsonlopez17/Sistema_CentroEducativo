import React, { useState, useEffect } from "react";

import { ListaEstudiantes } from "../../components/ListaEstudiantes";
import { useEstudiantes } from "../../hooks/useEstudiantes";
import './gestion_alumnos.css';



const GestionAlumnos: React.FC = () => {
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