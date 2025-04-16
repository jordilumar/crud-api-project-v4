import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CarsProvider } from './context/CarsContext'; // ¿Está importado?
import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <CarsProvider> {/* ¿Está presente? */}
          <App />
        </CarsProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
