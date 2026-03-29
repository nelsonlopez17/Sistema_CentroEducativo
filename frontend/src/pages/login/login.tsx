
import React, { useState } from 'react';
import './login.css'; 
import api from '../../api/axios'

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('login/', {
        username,
        password  });
      console.log('Login successful:', response.data);
      // Aquí puedes guardar el token en localStorage o en el estado global
    } catch (error) {
      console.error('Login failed:', error);
      alert('Error al iniciar sesión. Por favor, verifica tus credenciales.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Bienvenido</h1>
        <p>Ingresa tus datos</p>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Usuario</label>
            <input 
              type="text" 
              placeholder="Ej: admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-login">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;