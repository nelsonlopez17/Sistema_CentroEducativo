
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css'; 
import api from '../../api/axios';
import { useAuth } from '../../store/useAuth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuth((state) => state.setAuth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('login/', {
        username,
        password
      });

      // SimpleJWT returns access and user (customized in backend)
      const { access, user } = response.data;
      
      if (!user) {
        throw new Error('El servidor no devolvió información del usuario.');
      }

      setAuth(access, user);
      navigate('/inicio');

    } catch (error: any) {
      console.error('Login failed:', error);
      setError('Credenciales incorrectas. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-overlay"></div>
      <div className="login-card">
        <div className="login-header">
          <div className="logo-placeholder">🎓</div>
          <h1>INBACOOP</h1>
          <p>Sistema de Control Académico</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <div className="input-wrapper">
              <input 
                id="username"
                type="text" 
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <input 
                id="password"
                type="password" 
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? 'Iniciando sesión...' : 'Entrar al Sistema'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>&copy; 2026 Centro Educativo INBACOOP</p>
        </div>
      </div>
    </div>
  );
};

export default Login;