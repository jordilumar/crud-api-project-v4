import React from 'react';
import { Link } from 'react-router-dom';
import { Car, BarChart, User, LogOut, Star, Search, ArrowLeft } from 'lucide-react';
import Dropdown from 'react-bootstrap/Dropdown';

// Componente auxiliar con acceso a navigate
export function SalesButton({ onClick }) {
  return (
    <button className="btn btn-success d-flex align-items-center" onClick={onClick}>
      <BarChart className="me-2" size={20} />
      Ventas
    </button>
  );
}

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
  onNavigateToSales
}) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top animate-slide-in-top">
      <div className="container-fluid px-4 d-flex justify-content-between align-items-center position-relative">
        {/* Izquierda: Título + icono */}
        <div className="d-flex align-items-center">
          <Car className="me-2 text-primary" size={24} />
          <span className="fw-bold text-primary fs-5">
            Tu Garaje Virtual
          </span>
        </div>

        {/* Centro absoluto: Buscador (solo si hay sesión) */}
        {token && !showForm && (
          <form
            className="search-bar-container"
            style={{ width: "500px", margin: "0 auto" }}
            onSubmit={e => e.preventDefault()}
          >
            <div className="input-group shadow-sm">
              <span className="input-group-text bg-light">
                <Search size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control search-bar"
                placeholder="Buscar por modelo..."
                value={search}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </form>
        )}

        {/* Derecha: Botones dinámicos */}
        <div className="d-flex gap-2 animate-pop">
          {token && showForm ? (
            <button
              className="btn btn-outline-secondary d-flex align-items-center"
              onClick={onHideForm}
            >
              <ArrowLeft className="me-2" />
              Volver a búsqueda
            </button>
          ) : (
            token && (
              <>
                <button
                  className="btn btn-primary d-flex align-items-center justify-content-center"
                  onClick={onShowForm}
                >
                  Crea tu Coche
                </button>
                <SalesButton onClick={onNavigateToSales} />
              </>
            )
          )}

          {/* Botón de perfil circular con menú desplegable (siempre visible) */}
          <Dropdown align="end">
            <Dropdown.Toggle
              as="div"
              className="btn-profile-circle-container"
            >
              <button
                className="btn-profile-circle"
                title={token ? "Mi Cuenta" : "Login / Registro"}
              >
                <User size={20} />
              </button>
            </Dropdown.Toggle>

            {token ? (
              <Dropdown.Menu>
                <Dropdown.Item onClick={onProfileClick}>
                  <User size={16} className="me-2" /> Ver Perfil
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/favorites">
                  <Star size={16} className="me-2" /> Favoritos
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  className="text-danger"
                  onClick={onLogout}
                >
                  <LogOut size={16} className="me-2" /> Cerrar Sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            ) : (
              <Dropdown.Menu>
                <Dropdown.Item onClick={onProfileClick}>
                  <User size={16} className="me-2" /> Login / Registro
                </Dropdown.Item>
              </Dropdown.Menu>
            )}
          </Dropdown>
        </div>
      </div>
    </nav>
  );
}