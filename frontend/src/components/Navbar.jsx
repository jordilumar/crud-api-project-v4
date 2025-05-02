import React from 'react';
import { Search, User, LogOut, Car, Calendar, Heart, BarChart, Shield } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';
import SalesButton from './SalesButton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  token,
  username,
  search, 
  showForm, 
  onSearch, 
  onLogout, 
  onProfileClick, 
  onShowForm, 
  onHideForm,
  onNavigateToSales,
  onNavigateToBookings
}) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top animate-slide-in-top">
      <div className="container-fluid px-4 d-flex justify-content-between align-items-center position-relative">
        {/* Logo y búsqueda */}
        <div className="d-flex align-items-center">
          <a className="navbar-brand text-primary d-flex align-items-center" href="/">
            <Car className="me-2" />
            Tu Garaje Virtual
          </a>
          
          <div className="search-bar ms-4">
            <input
              type="text"
              className="form-control search-input"
              placeholder="Buscar por modelo..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
            />
            <Search className="search-icon" />
          </div>
        </div>

        {/* Derecha: Botones dinámicos */}
        <div className="d-flex gap-2 animate-pop">
          {token && showForm ? (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={onHideForm}
            >
              <Search className="me-1" size={16} />
              Volver a búsqueda
            </button>
          ) : (
            token && (
              <>
                {/* Solo mostrar estos botones si el usuario es admin */}
                {isAdmin && (
                  <button
                    className="btn btn-orange d-flex align-items-center justify-content-center text-white"
                    onClick={onShowForm}
                  >
                    <Car className="me-2" size={18} />
                    Crea tu Coche
                  </button>
                )}
                
                {isAdmin && (
                  <SalesButton onClick={onNavigateToSales} />
                )}
                
                {/* El botón de reservas lo ve cualquier usuario */}
                <button
                  className="btn btn-primary d-flex align-items-center text-white"
                  onClick={onNavigateToBookings}
                >
                  <Calendar className="me-2" size={18} />
                  Reservas
                </button>
              </>
            )
          )}

          {/* Perfil y Logout */}
          {token && (
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" id="dropdown-user">
                <User size={18} />
                <span className="ms-2">{username}</span>
                {isAdmin && <Shield size={14} className="ms-1 text-primary" />}
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
                <Dropdown.Item onClick={onProfileClick}>
                  <User className="me-2" size={16} />
                  Perfil
                </Dropdown.Item>
                
                {/* Solo mostrar favoritos para usuarios normales */}
                {!isAdmin && (
                  <Dropdown.Item onClick={() => navigate('/favorites')}>
                    <Heart className="me-2" size={16} fill="#FF5A5F" stroke="#FF5A5F" />
                    Favoritos
                  </Dropdown.Item>
                )}
                
                {/* Solo mostrar admin panel para admins */}
                {isAdmin && (
                  <Dropdown.Item onClick={() => navigate('/admin/bookings')}>
                    <Shield className="me-2" size={16} />
                    Panel de Admin
                  </Dropdown.Item>
                )}
                
                <Dropdown.Divider />
                <Dropdown.Item onClick={onLogout}>
                  <LogOut className="me-2" size={16} />
                  Cerrar Sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
      </div>
    </nav>
  );
}