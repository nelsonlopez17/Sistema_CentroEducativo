import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login/login';
import Inicio from './pages/inicio/inicio';
import GestionAlumnos from './pages/Alumnos/gestion_alumnos';
import Usuarios from './pages/Admin/Usuarios/usuarios';
import MainLayout from './components/Layout/MainLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas dentro del MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/gestion-alumnos" element={<GestionAlumnos />} />
          <Route path="/usuarios" element={<Usuarios />} />
        </Route>
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;