import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Search, Car, BarChart, ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, User, LogOut, Star, Check, AlertCircle, Info } from 'lucide-react';
import SalesCharts from './pages/SalesCharts';
import CarForm from './components/CarForm';
import CarList from './components/CarList';
import { useEffect, useState, useRef } from 'react';
import { createCar, updateCar, deleteCar, getCars, getUserFavorites } from './api'; // Añadir getUserFavorites aquí
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/base.css';
import './styles/navbar.css';
import './styles/car-list.css';
import './styles/pagination.css';
import './styles/animations.css';
import './styles/buttons.css';
import './styles/cards.css';
import './styles/search-bar.css';
import './styles/features-preview.css';
import './App.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import FavoritesPage from './components/FavoritesPage';

function App() {
  const [cars, setCars] = useState([]);
  const [editingCar, setEditingCar] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const searchTimeout = useRef(null);

  // Estado para la paginación
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 6;

  // Estado para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);

  const [animationClass, setAnimationClass] = useState(''); // Estado para la animación
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado para controlar la carga

  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // Controla la visibilidad del modal
  const [createdCar, setCreatedCar] = useState(null); // Almacena los detalles del coche creado

  const [showEditModal, setShowEditModal] = useState(false); // Controla la visibilidad del modal de edición
  const [editedCar, setEditedCar] = useState(null); // Almacena los detalles del coche editado

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showAuthModal, setShowAuthModal] = useState(false); // Controla la visibilidad del modal
  const [isSessionLoading, setIsSessionLoading] = useState(false);

  // Estados para los modales de notificación personalizados
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLoginSuccessModal, setShowLoginSuccessModal] = useState(false);
  const [showRegisterSuccessModal, setShowRegisterSuccessModal] = useState(false);

  // Estados para controlar los modales de autenticación
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Añade un nuevo estado para controlar el modal del perfil
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Añade este nuevo estado para controlar la animación
  const [paginationAnimation, setPaginationAnimation] = useState('');

  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
    setShowLoginModal(false);
    
    setIsSessionLoading(true);
    
    // Cargar los coches inmediatamente
    loadCars(search)
      .then(() => {
        setIsSessionLoading(false);
        setShowLoginSuccessModal(true);
      })
      .catch((error) => {
        console.error('Error al cargar coches:', error);
        setIsSessionLoading(false);
      });
  };

  const handleRegister = () => {
    setShowRegisterModal(false); // Cierra el modal de registro
    setShowRegisterSuccessModal(true); // Muestra el modal de éxito de registro
  };

  // Nueva función para manejar el logout
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username'); // También eliminar el username
    setShowLogoutModal(true); // Mostrar modal personalizado en lugar de alert
  };

  // Modificar esta función para abrir el modal de login por defecto
  const openAuthModal = () => {
    setShowLoginModal(true);
  };

  // Función para cambiar del modal de login al de registro
  const switchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  // Función para cambiar del modal de registro al de login
  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  // Función para abrir directamente el modal de registro
  const openRegisterModal = () => {
    setShowRegisterModal(true);
  };

  // Añade una nueva función para abrir el modal de perfil
  const openProfileModal = () => {
    setShowProfileModal(true);
  };

  // Efecto para recargar coches al cambiar de página
  useEffect(() => {
    loadCars(search); // Carga los coches con el término de búsqueda actual
  }, [page, search]); // Ejecuta este efecto cuando cambie la página o el término de búsqueda

  // Función para cargar coches desde la API sin mostrar loading durante la paginación
  const loadCars = async (model = search, pageToLoad = page) => {
    try {
      setIsLoading(false);
      
      const { data, total } = await getCars(model, pageToLoad, limit);
      setCars(data);
      setTotal(total);
      
      // Verificar cuáles son favoritos si el usuario está logueado
      const username = localStorage.getItem('username');
      if (username) {
        try {
          const favoritesResponse = await getUserFavorites(username);
          window.dispatchEvent(new CustomEvent('favoritesUpdated', { 
            detail: { favoriteIds: favoritesResponse.carIds } 
          }));
        } catch (error) {
          console.error("Error al cargar favoritos:", error);
        }
      }
    } catch (error) {
      console.error('Error cargando coches:', error);
    }
  };

  // Crear una versión específica para paginación que nunca muestre loading
  const loadCarsForPagination = loadCars;

  const handleSearch = (text) => {
    setSearch(text);
    setIsSearching(true);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      setPage(1); // Reinicia a la primera página
      loadCars(text); // Carga los coches filtrados desde la página 1
      setIsSearching(false);
    }, 1000);
  };

  const handleCreate = async (car) => {
    try {
      if (editIndex !== null) {
        await updateCar(car.id, car);
        setEditIndex(null);
        setEditedCar(car); // Almacena los detalles del coche editado
        setShowEditModal(true); // Muestra el modal de edición
      } else {
        await createCar(car);
        setCreatedCar(car); // Almacena los detalles del coche creado
        setShowConfirmationModal(true); // Muestra el modal de confirmación
      }
      setEditingCar(null);
      setShowForm(false);
      loadCars(search);
    } catch (error) {
      const errorMessage = await error.response.json();
      if (errorMessage.error === "Make cannot contain numbers. Please enter a valid make.") {
        alert("No se pueden introducir números en la marca. Por favor, corrige el error.");
        setShowForm(true); // Redirigir al formulario de creación
      } else {
        console.error("Error al crear o editar el coche:", errorMessage.error);
      }
    }
  };

  const handleEdit = (car, index) => {
    setEditingCar(car);
    setEditIndex(index);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!carToDelete) return;

    await deleteCar(carToDelete.id);
    setShowDeleteModal(false);
    setCarToDelete(null);
    loadCars(search); // Recargar la lista de coches después de eliminar
  };

  const confirmDelete = (car) => {
    setCarToDelete(car);
    setShowDeleteModal(true);
  };

  const totalPages = Math.ceil(total / limit);

  // Función para manejar cambios de página sin mostrar loading
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      // Primero aplicamos una animación de salida
      setPaginationAnimation('animate-fade-out');
      
      // Después de un breve retraso, cambiamos la página y aplicamos la animación de entrada
      setTimeout(() => {
        setPage(newPage);
        loadCarsForPagination(search, newPage);
        
        // Cambiamos a la animación de entrada
        setPaginationAnimation('animate-fade-in');
        
        // Reiniciamos la animación después de completarse para futuros cambios
        setTimeout(() => {
          setPaginationAnimation('');
        }, 500);
      }, 300);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    // Siempre mostrar el botón para la página 1
    buttons.push(
      <button
        key="page-1"
        className={`pagination-button ${page === 1 ? "active" : ""}`}
        onClick={() => handlePageChange(1)}
      >
        1
      </button>
    );

    if (totalPages > maxVisibleButtons) {
      if (page > 3) {
        buttons.push(<span key="dots-left" className="pagination-dots">...</span>);
      }

      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(totalPages - 1, page + 1);

      for (let i = startPage; i <= endPage; i++) {
        buttons.push(
          <button
            key={`page-${i}`} // Clave única para cada botón
            className={`pagination-button ${page === i ? "active" : ""}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        );
      }

      if (page < totalPages - 2) {
        buttons.push(<span key="dots-right" className="pagination-dots">...</span>);
      }
    } else {
      for (let i = 2; i <= totalPages; i++) {
        buttons.push(
          <button
            key={`page-${i}`} // Clave única para cada botón
            className={`pagination-button ${page === i ? "active" : ""}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        );
      }
    }

    // Siempre mostrar el botón para la última página
    if (totalPages > 1) {
      buttons.push(
        <button
          key={`page-${totalPages}`} // Clave única para la última página
          className={`pagination-button ${page === totalPages ? "active" : ""}`}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  // Dentro de la función App(), añade estos useEffects

  // Efecto para detectar actualizaciones de coches desde otros componentes
  useEffect(() => {
    const handleCarUpdate = (event) => {
      // Actualiza la lista de coches si estamos en la misma página que el coche actualizado
      const updatedCar = event.detail.car;
      setCars(prevCars => 
        prevCars.map(car => car.id === updatedCar.id ? updatedCar : car)
      );
    };
    
    const handleCarDelete = (event) => {
      // Elimina el coche de la lista si estamos en la página que lo contiene
      const deletedCarId = event.detail.carId;
      setCars(prevCars => prevCars.filter(car => car.id !== deletedCarId));
      // Si la página queda vacía, recargamos para obtener la página correcta
      if (cars.length === 1) {
        loadCars(search);
      }
    };

    window.addEventListener('carUpdated', handleCarUpdate);
    window.addEventListener('carDeleted', handleCarDelete);
    
    return () => {
      window.removeEventListener('carUpdated', handleCarUpdate);
      window.removeEventListener('carDeleted', handleCarDelete);
    };
  }, [cars, search]);

  // Efecto para verificar cambios al volver a la página principal
  useEffect(() => {
    const checkForUpdates = () => {
      const lastUpdate = localStorage.getItem('lastCarUpdate');
      const lastDelete = localStorage.getItem('lastCarDelete');
      const lastCheck = localStorage.getItem('lastCarCheck') || '0';
      
      if ((lastUpdate && lastUpdate > lastCheck) || 
          (lastDelete && lastDelete > lastCheck)) {
        // Recargamos los datos si hubo cambios
        loadCars(search);
        localStorage.setItem('lastCarCheck', Date.now().toString());
      }
    };
    
    // Verificar cuando la ventana obtiene foco (usuario vuelve a la pestaña)
    window.addEventListener('focus', checkForUpdates);
    
    return () => {
      window.removeEventListener('focus', checkForUpdates);
    };
  }, [search]);

  return (
    <Router>
      <div className="app-container">
        {/* Modal de Login/Registro */}
        <Modal show={showAuthModal} onHide={() => setShowAuthModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{token ? 'Bienvenido' : 'Inicia Sesión o Regístrate'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {!token ? (
              <>
                <LoginForm onLogin={handleLogin} />
                <hr />
                <RegisterForm onRegister={handleRegister} />
              </>
            ) : (
              <p>Ya has iniciado sesión.</p>
            )}
          </Modal.Body>
          {!token && (
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAuthModal(false)}>
                Cerrar
              </Button>
            </Modal.Footer>
          )}
        </Modal>

        {/* Modal de éxito al cerrar sesión */}
        <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title><Info className="me-2" size={24} /> Sesión Cerrada</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Has cerrado sesión correctamente. ¡Hasta pronto!
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => setShowLogoutModal(false)}>
              Aceptar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de éxito al iniciar sesión */}
        <Modal show={showLoginSuccessModal} onHide={() => setShowLoginSuccessModal(false)} centered>
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title><Check className="me-2" size={24} /> ¡Bienvenido!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Has iniciado sesión correctamente. Ahora puedes acceder a todas las funcionalidades.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={() => setShowLoginSuccessModal(false)}>
              Continuar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de éxito al registrarse */}
        <Modal show={showRegisterSuccessModal} onHide={() => setShowRegisterSuccessModal(false)} centered>
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title><Check className="me-2" size={24} /> ¡Registro Exitoso!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Te has registrado correctamente. Ahora puedes iniciar sesión con tus credenciales.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={() => setShowRegisterSuccessModal(false)}>
              Aceptar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de Login */}
        <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered size="sm">
          <Modal.Header closeButton className="py-2">
            <Modal.Title className="fs-5">Iniciar Sesión</Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-3">
            <LoginForm onLogin={handleLogin} />
            <div className="d-flex justify-content-center mt-3">
              <Button variant="link" size="sm" onClick={switchToRegister} className="p-0">
                ¿No tienes cuenta? Regístrate
              </Button>
            </div>
          </Modal.Body>
        </Modal>

        {/* Modal de Registro */}
        <Modal show={showRegisterModal} onHide={() => setShowRegisterModal(false)} centered size="sm">
          <Modal.Header closeButton className="py-2">
            <Modal.Title className="fs-5">Crear Cuenta</Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-3">
            <RegisterForm onRegister={handleRegister} />
            <div className="d-flex justify-content-center mt-3">
              <Button variant="link" size="sm" onClick={switchToLogin} className="p-0">
                ¿Ya tienes cuenta? Inicia sesión
              </Button>
            </div>
          </Modal.Body>
        </Modal>

        {/* Modal de Perfil de Usuario */}
        <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title><User className="me-2" size={24} /> Mi Perfil</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center mb-3">
              <div className="bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                <User size={40} className="text-secondary" />
              </div>
            </div>
            
            <div className="mb-3">
              <h5 className="mb-3">Información de usuario</h5>
              <p><strong>Usuario:</strong> {localStorage.getItem('username')}</p>
              <p><strong>Fecha de registro:</strong> {new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="mb-3">
              <h5 className="mb-3">Actividad</h5>
              <p><strong>Coches favoritos:</strong> <Link to="/favorites" onClick={() => setShowProfileModal(false)}>Ver favoritos</Link></p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Rutas de la aplicación */}
        <Routes>
          <Route
            path="/"
            element={
              <div className="app-container">
                {/* Navbar */}
                <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top animate-slide-in-top">
                  <div className="container-fluid px-4 d-flex justify-content-between align-items-center position-relative">

                    {/* Izquierda: Título + icono */}
                    <div className="d-flex align-items-center">
                      <Car className="me-2 text-primary" size={24} />
                      <span className="fw-bold text-primary fs-5">Tu Garaje Virtual</span>
                    </div>

                    {/* Centro absoluto: Buscador (solo si hay sesión) */}
                    {token && !showForm && (
                      <form
                        className="search-bar-container"
                        style={{ width: '500px', margin: '0 auto' }}
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
                            onChange={(e) => handleSearch(e.target.value)}
                          />
                        </div>
                      </form>
                    )}

                    {/* Derecha: Botones dinámicos */}
                    <div className="d-flex gap-2 animate-pop">
                      {token && showForm ? (
                        <button
                          className="btn btn-outline-secondary d-flex align-items-center"
                          onClick={() => setShowForm(false)}
                        >
                          <ArrowLeft className="me-2" />
                          Volver a búsqueda
                        </button>
                      ) : token && (
                        <>
                          <button
                            className="btn btn-primary d-flex align-items-center justify-content-center"
                            onClick={() => {
                              setEditingCar(null);
                              setShowForm(true);
                            }}
                          >
                            Crea tu Coche
                          </button>
                          <button
                            className="btn btn-success d-flex align-items-center"
                            onClick={() => window.location.href = '/annual-sales'}
                          >
                            <BarChart className="me-2" size={20} />
                            Ventas
                          </button>
                        </>
                      )}
                      
                      {/* Botón de perfil circular con menú desplegable (siempre visible) */}
                      <Dropdown align="end">
                        <Dropdown.Toggle as="div" className="btn-profile-circle-container">
                          <button 
                            className="btn-profile-circle"
                            title={token ? "Mi Cuenta" : "Login / Registro"}
                          >
                            <User size={20} />
                          </button>
                        </Dropdown.Toggle>
                        
                        {token ? (
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={openProfileModal}>
                              <User size={16} className="me-2" /> Ver Perfil
                            </Dropdown.Item>
                            <Dropdown.Item as={Link} to="/favorites">
                              <Star size={16} className="me-2" /> Favoritos
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              className="text-danger"
                              onClick={handleLogout}
                            >
                              <LogOut size={16} className="me-2" /> Cerrar Sesión
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        ) : (
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={openAuthModal}>
                              <User size={16} className="me-2" /> Login / Registro
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        )}
                      </Dropdown>
                    </div>
                  </div>
                </nav>
                {/* Contenido */}
                <div className={`content-container mt-5 pt-4 ${animationClass}`}>
                  {token && showForm ? (
                    <div className="form-container animate-bounce">
                      <CarForm onSubmit={handleCreate} editingCar={editingCar} />
                    </div>
                  ) : (
                    <div className={`animate-fade-up ${animationClass}`}>
                      {!token ? (
                        // Modificar la pantalla de bienvenida para hacerla más compacta
                        <div className="welcome-container text-center py-3">
                          <div className="welcome-card bg-white rounded-lg shadow-lg p-4 animate-fade-in">
                            <Car size={50} className="text-primary mb-2" />
                            <h2 className="fw-bold mb-2">¡Bienvenido a Car Manager!</h2>
                            <p className="text-muted mb-3">
                              Tu plataforma para gestionar coches, analizar ventas y más.
                            </p>
                            <div className="features-grid mb-3">
                              <div className="feature-item p-2">
                                <div className="feature-icon mb-2 rounded-circle bg-primary bg-opacity-10 p-2 d-inline-block">
                                  <Car size={18} className="text-primary" />
                                </div>
                                <h6>Gestión de Coches</h6>
                                <p className="text-muted small">Añade y organiza tu colección</p>
                              </div>
                              <div className="feature-item p-2">
                                <div className="feature-icon mb-2 rounded-circle bg-success bg-opacity-10 p-2 d-inline-block">
                                  <BarChart size={18} className="text-success" />
                                </div>
                                <h6>Análisis de Ventas</h6>
                                <p className="text-muted small">Visualiza datos con gráficos</p>
                              </div>
                              <div className="feature-item p-2">
                                <div className="feature-icon mb-2 rounded-circle bg-warning bg-opacity-10 p-2 d-inline-block">
                                  <Star size={18} className="text-warning" />
                                </div>
                                <h6>Favoritos</h6>
                                <p className="text-muted small">Marca tus coches favoritos</p>
                              </div>
                            </div>
                            <button 
                              className="btn btn-primary px-4 py-2 shadow-sm animate-pulse mb-2"
                              onClick={openAuthModal}
                            >
                              <User size={16} className="me-1" /> Iniciar Sesión
                            </button>
                            <p className="mt-1 text-muted small">
                              ¿No tienes una cuenta? <Button variant="link" className="p-0" size="sm" onClick={openRegisterModal}>Regístrate gratis</Button>
                            </p>
                          </div>
                        </div>
                      ) : isSessionLoading ? (
                        <div className="text-center my-5 p-5 bg-white rounded shadow-sm">
                          <div className="spinner-border text-primary mb-4" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Cargando...</span>
                          </div>
                          <h3 className="text-primary">Iniciando sesión...</h3>
                          <p className="text-muted">Cargando tu garaje virtual</p>
                        </div>
                      ) : isLoading ? (
                        <div className="text-center my-5 p-5 bg-white rounded shadow-sm">
                          <div className="spinner-border text-primary mb-4" role="status">
                            <span className="visually-hidden">Cargando...</span>
                          </div>
                          <p className="text-muted">Cargando lista de coches...</p>
                        </div>
                      ) : (
                        <>
                          <CarList 
                            cars={cars} 
                            onEdit={handleEdit} 
                            onDelete={confirmDelete} 
                            animationClass={paginationAnimation} 
                          />
                          
                          {/* Botones para cambiar de pagina */}
                          <div className="pagination animate-slide-in-bottom">
                            <button
                              className="pagination-arrow"
                              onClick={() => handlePageChange(1)}
                              disabled={page === 1}
                            >
                              <ChevronsLeft />
                            </button>
                            <button
                              className="pagination-arrow"
                              onClick={() => handlePageChange(page - 1)}
                              disabled={page === 1}
                            >
                              <ChevronLeft />
                            </button>
                            {renderPaginationButtons()}
                            <button
                              className="pagination-arrow"
                              onClick={() => handlePageChange(page + 1)}
                              disabled={page === totalPages}
                            >
                              <ChevronRight />
                            </button>
                            <button
                              className="pagination-arrow"
                              onClick={() => handlePageChange(totalPages)}
                              disabled={page === totalPages}
                            >
                              <ChevronsRight />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Modal de confirmación */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    ¿Estás seguro de que deseas eliminar el coche <strong>{carToDelete?.make} {carToDelete?.model}</strong>?
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                      Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                      Eliminar
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Modal de confirmación de creación */}
                <Modal show={showConfirmationModal} onHide={() => setShowConfirmationModal(false)} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>¡Coche Creado!</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    {createdCar && (
                      <div>
                        <p><strong>Marca:</strong> {createdCar.make}</p>
                        <p><strong>Modelo:</strong> {createdCar.model}</p>
                        <p><strong>Año:</strong> {createdCar.year}</p>
                        <p><strong>Características:</strong> {createdCar.features?.join(', ')}</p>
                      </div>
                    )}
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowConfirmationModal(false)}>
                      OK
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Modal de confirmación de edición */}
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>¡Coche Editado!</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    {editedCar && (
                      <div>
                        <p><strong>Marca:</strong> {editedCar.make}</p>
                        <p><strong>Modelo:</strong> {editedCar.model}</p>
                        <p><strong>Año:</strong> {editedCar.year}</p>
                        <p><strong>Características:</strong> {editedCar.features?.join(', ')}</p>
                      </div>
                    )}
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowEditModal(false)}>
                      OK
                    </Button>
                  </Modal.Footer>
                </Modal>
              </div>
            }
          />
          <Route 
            path="/annual-sales/:model?" 
            element={<SalesCharts />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route
            path="/login"
            element={
              <div>
                {!token ? (
                  <>
                    <LoginForm onLogin={handleLogin} />
                    <RegisterForm onRegister={handleRegister} />
                  </>
                ) : (
                  <div>Bienvenido a la aplicación</div>
                )}
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;