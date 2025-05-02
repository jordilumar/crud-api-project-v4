import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, BarChart, Star, User, Calendar } from 'lucide-react';
import Button from 'react-bootstrap/Button';
import Navbar from '../components/Navbar';
import CarForm from '../components/CarForm';
import CarsList from '../components/CarList';
import Pagination from '../components/Pagination';
import useCarManagement from '../hooks/useCarManagement';
import { useAuth } from '../context/AuthContext';
import { useCars } from '../context/CarsContext';
import { 
  LoginModal, 
  RegisterModal, 
  LoginSuccessModal, 
  RegisterSuccessModal,
  LogoutModal,
  ProfileModal
} from '../components/AuthModals';
import { 
  DeleteConfirmationModal, 
  CarCreationModal, 
  CarEditModal 
} from '../components/modals/CarModals';
import BookingForm from '../components/BookingForm';

export default function Home() {
  const navigate = useNavigate();
  const { token, username, logout } = useAuth();
  const { cars, loading: carsLoading } = useCars();
  
  const { 
    search, 
    isLoading, 
    page, 
    setPage,
    total, 
    limit,
    handleSearch, 
    fetchCars 
  } = useCarManagement();

  // Estados locales
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [animationClass, setAnimationClass] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Estados para modales
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginSuccessModal, setShowLoginSuccessModal] = useState(false);
  const [showRegisterSuccessModal, setShowRegisterSuccessModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Estados para datos de modales
  const [carToDelete, setCarToDelete] = useState(null);
  const [createdCar, setCreatedCar] = useState(null);
  const [editedCar, setEditedCar] = useState(null);

  // Manejadores para autenticación
  const handleLogin = () => {
    setShowLoginModal(false);
    setIsSessionLoading(true);
    
    setTimeout(() => {
      setIsSessionLoading(false);
      setShowLoginSuccessModal(true);
    }, 1000);
  };

  const handleRegister = () => {
    setShowRegisterModal(false);
    setShowRegisterSuccessModal(true);
  };

  const handleLogout = () => {
    logout();
    setShowLogoutModal(true);
    // Force a re-render after logout
    navigate('/');
  };

  // Manejadores para modales
  const openAuthModal = () => setShowLoginModal(true);
  const switchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };
  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };
  const openRegisterModal = () => setShowRegisterModal(true);
  const openProfileModal = () => setShowProfileModal(true);

  // Manejadores para CRUD
  const handleCreate = async (car) => {
    if (editIndex !== null) {
      setEditedCar(car);
      setShowEditModal(true);
    } else {
      setCreatedCar(car);
      setShowConfirmationModal(true);
    }
    setEditingCar(null);
    setShowForm(false);
  };

  const handleEdit = (car, index) => {
    setEditingCar(car);
    setEditIndex(index);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!carToDelete) return;
    // Lógica de eliminación
    setShowDeleteModal(false);
    setCarToDelete(null);
  };

  const confirmDelete = (car) => {
    setCarToDelete(car);
    setShowDeleteModal(true);
  };

  const handleNavigateToBookings = () => {
    navigate('/bookings');
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="app-container">
      {/* Only render the Navbar if user is authenticated */}
      {token ? (
        <Navbar 
          token={token}
          username={username}
          search={search}
          onSearch={handleSearch}
          showForm={showForm}
          onShowForm={() => {
            setEditingCar(null);
            setShowForm(true);
          }}
          onHideForm={() => setShowForm(false)}
          onLogout={handleLogout}
          onProfileClick={token ? openProfileModal : openAuthModal}
          onNavigateToSales={() => navigate("/annual-sales")}
          onNavigateToBookings={handleNavigateToBookings}
        />
      ) : (
        // Simple header for non-authenticated users
        <div className="navbar navbar-light bg-white shadow-sm fixed-top animate-slide-in-top">
          <div className="container-fluid px-4 d-flex justify-content-between align-items-center">
            <a className="navbar-brand text-primary d-flex align-items-center" href="/">
              <Car className="me-2" />
              Tu Garaje Virtual
            </a>
          </div>
        </div>
      )}

      <div className={`content-container mt-5 pt-4 ${animationClass}`}>

        {token && showForm ? (
          <div className="form-container animate-bounce">
            <CarForm onSubmit={handleCreate} editingCar={editingCar} />
          </div>
        ) : token && showBookingForm ? (
          <div className="form-container animate-bounce">
            <BookingForm onBookingCreated={() => {
              setTimeout(() => {
                setShowBookingForm(false);
              }, 3000);
            }} />
          </div>
        ) : (
          <div className={`animate-fade-up ${animationClass}`}>
            {!token ? (
              // Pantalla de bienvenida
              <div className="welcome-container text-center py-3">
                <div className="welcome-card bg-white rounded-lg shadow-lg p-4 animate-fade-in">
                  <Car size={50} className="text-primary mb-2" />
                  <h2 className="fw-bold mb-2">
                    ¡Bienvenido a Car Manager!
                  </h2>
                  <p className="text-muted mb-3">
                    Tu plataforma para gestionar coches, analizar ventas
                    y más.
                  </p>
                  <div className="features-grid mb-3">
                    <div className="feature-item p-2">
                      <div className="feature-icon mb-2 rounded-circle bg-primary bg-opacity-10 p-2 d-inline-block">
                        <Car size={18} className="text-primary" />
                      </div>
                      <h6>Gestión de Coches</h6>
                      <p className="text-muted small">
                        Añade y organiza tu colección
                      </p>
                    </div>
                    <div className="feature-item p-2">
                      <div className="feature-icon mb-2 rounded-circle bg-success bg-opacity-10 p-2 d-inline-block">
                        <BarChart size={18} className="text-success" />
                      </div>
                      <h6>Análisis de Ventas</h6>
                      <p className="text-muted small">
                        Visualiza datos con gráficos
                      </p>
                    </div>
                    <div className="feature-item p-2">
                      <div className="feature-icon mb-2 rounded-circle bg-warning bg-opacity-10 p-2 d-inline-block">
                        <Star size={18} className="text-warning" />
                      </div>
                      <h6>Favoritos</h6>
                      <p className="text-muted small">
                        Marca tus coches favoritos
                      </p>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary px-4 py-2 shadow-sm animate-pulse mb-2"
                    onClick={openAuthModal}
                  >
                    <User size={16} className="me-1" /> Iniciar Sesión
                  </button>
                  <p className="mt-1 text-muted small">
                    ¿No tienes una cuenta?{" "}
                    <Button
                      variant="link"
                      className="p-0"
                      size="sm"
                      onClick={openRegisterModal}
                    >
                      Regístrate gratis
                    </Button>
                  </p>
                </div>
              </div>
            ) : isSessionLoading ? (
              <div className="text-center my-5 p-5 bg-white rounded shadow-sm">
                <div
                  className="spinner-border text-primary mb-4"
                  role="status"
                  style={{ width: "3rem", height: "3rem" }}
                >
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <h3 className="text-primary">Iniciando sesión...</h3>
                <p className="text-muted">Cargando tu garaje virtual</p>
              </div>
            ) : isLoading ? (
              <div className="text-center my-5 p-5 bg-white rounded shadow-sm">
                <div
                  className="spinner-border text-primary mb-4"
                  role="status"
                >
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="text-muted">
                  Cargando lista de coches...
                </p>
              </div>
            ) : (
              <>
                <CarsList
                  cars={cars}
                  onEdit={handleEdit}
                  onDelete={confirmDelete}
                  animationClass={animationClass}
                />

                <Pagination 
                  page={page} 
                  totalPages={totalPages} 
                  onPageChange={(newPage) => {
                    setPage(newPage);
                    fetchCars(search, newPage);
                  }} 
                />
              </>
            )}

          </div>
        )}
      </div>

      {/* Modales de autenticación */}
      <LoginModal 
        show={showLoginModal} 
        onHide={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        switchToRegister={switchToRegister}
      />
      
      <RegisterModal 
        show={showRegisterModal} 
        onHide={() => setShowRegisterModal(false)}
        onRegister={handleRegister}
        switchToLogin={switchToLogin}
      />
      
      <LoginSuccessModal 
        show={showLoginSuccessModal} 
        onHide={() => setShowLoginSuccessModal(false)}
      />
      
      <RegisterSuccessModal 
        show={showRegisterSuccessModal} 
        onHide={() => setShowRegisterSuccessModal(false)}
      />
      
      <LogoutModal 
        show={showLogoutModal} 
        onHide={() => setShowLogoutModal(false)}
      />
      
      <ProfileModal 
        show={showProfileModal} 
        onHide={() => setShowProfileModal(false)}
        username={username}
      />

      {/* Modales de CRUD */}
      <DeleteConfirmationModal 
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        car={carToDelete}
        onDelete={handleDelete}
      />
      
      <CarCreationModal 
        show={showConfirmationModal}
        onHide={() => setShowConfirmationModal(false)}
        car={createdCar}
      />
      
      <CarEditModal 
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        car={editedCar}
      />

      {token && !showForm && !showBookingForm && (
        <button 
          className="floating-book-button"
          onClick={() => setShowBookingForm(true)}
          title="Reservar un coche"
        >
          <Calendar size={22} />
            <span> Reservar</span>
        </button>
      )}
    </div>
  );
}