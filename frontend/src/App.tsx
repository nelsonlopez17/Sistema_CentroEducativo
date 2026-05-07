import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login/login';
import Inicio from './pages/inicio/inicio';
import GestionAlumnos from './pages/Alumnos/gestion_alumnos';
import Usuarios from './pages/Admin/Usuarios/usuarios';
import ListaDocentes from './pages/Docentes/ListaDocentes';
import GradosSecciones from './pages/GradosSecciones/GradosSecciones';
import CursosPensum from './pages/CursosPensum/CursosPensum';
import CiclosUnidades from './pages/CiclosUnidades/CiclosUnidades';
import Inscripciones from './pages/Inscripciones/Inscripciones';
import Asignaciones from './pages/Asignaciones/Asignaciones';
import Calificaciones from './pages/Calificaciones/Calificaciones';
import Recuperaciones from './pages/Recuperaciones/Recuperaciones';
import Auditoria from './pages/Auditoria/Auditoria';
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { useAuth } from './store/useAuth';

function App() {
  const initializeAuth = useAuth(state => state.initialize);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas dentro del MainLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/gestion-alumnos" element={<GestionAlumnos />} />
            <Route path="/docentes" element={<ListaDocentes />} />
            <Route path="/grados-secciones" element={<GradosSecciones />} />
            <Route path="/cursos-pensum" element={<CursosPensum />} />
            <Route path="/ciclos-unidades" element={<CiclosUnidades />} />
            <Route path="/inscripciones" element={<Inscripciones />} />
            <Route path="/asignaciones" element={<Asignaciones />} />
            <Route path="/calificaciones" element={<Calificaciones />} />
            <Route path="/recuperaciones" element={<Recuperaciones />} />
            
            {/* Solo Admin */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/auditoria" element={<Auditoria />} />
            </Route>
          </Route>
        </Route>

        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Routes>
    </Router>
  );
}

export default App;