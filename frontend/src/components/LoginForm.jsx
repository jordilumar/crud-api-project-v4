import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Solo para el proceso de login inicial
      const basicAuth = btoa(`${username}:${password}`);
      
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 
          'Authorization': `Basic ${basicAuth}`,
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => 
          ({ error: `Error ${response.status}: ${response.statusText}` })
        );
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Almacenar token JWT y rol de usuario
      login(username, data.token, data.is_admin);
      
      // Pasar datos al callback
      onLogin(username, data.token);
    } catch (error) {
      console.error('Error en el login:', error);
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="compact-form">
      {error && <div className="alert alert-danger py-1 px-2 mb-2 small">{error}</div>}
      <div className="mb-2">
        <label className="form-label small mb-1">Usuario</label>
        <input 
          type="text" 
          className="form-control form-control-sm" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          autoComplete="username"
          required 
        />
      </div>
      <div className="mb-2">
        <label className="form-label small mb-1">Contraseña</label>
        <input 
          type="password" 
          className="form-control form-control-sm" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          autoComplete="current-password"
          required 
        />
      </div>
      <button type="submit" className="btn btn-primary btn-sm w-100 mt-1">Iniciar Sesión</button>
    </form>
  );
}