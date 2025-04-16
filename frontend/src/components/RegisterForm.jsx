import { useState } from 'react';

export default function RegisterForm({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Función para validar formato de email
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validar que el username tenga formato de email
    if (!isValidEmail(username)) {
      setError('Por favor, introduce una dirección de email válida.');
      return;
    }
    
    try {
      // Crear el token Basic Auth (Base64 de username:password)
      const basicAuth = btoa(`${username}:${password}`);
      
      const response = await fetch('http://localhost:5000/register', {
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
      
      await response.json();
      onRegister(); // Llamar a la función que mostrará el modal personalizado
    } catch (error) {
      console.error('Error en el registro:', error);
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="compact-form">
      {error && <div className="alert alert-danger py-1 px-2 mb-2 small">{error}</div>}
      <div className="mb-2">
        <label className="form-label small mb-1">Email</label>
        <input 
          type="email" // Cambiado a type="email" para validación básica del navegador
          className="form-control form-control-sm" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          autoComplete="email"
          placeholder="ejemplo@correo.com"
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
          autoComplete="new-password"
          required 
        />
      </div>
      <button type="submit" className="btn btn-primary btn-sm w-100 mt-1">Registrarse</button>
    </form>
  );
}