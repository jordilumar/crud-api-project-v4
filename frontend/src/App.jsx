import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Search, Car, BarChart, ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import SalesCharts from './pages/SalesCharts';
import CarForm from './components/CarForm';
import CarList from './components/CarList';
import { useEffect, useState, useRef } from 'react';
import { createCar, updateCar, deleteCar, getCars } from './api';
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

  // Efecto para recargar coches al cambiar de página
  useEffect(() => {
    loadCars(search); // Carga los coches con el término de búsqueda actual
  }, [page, search]); // Ejecuta este efecto cuando cambie la página o el término de búsqueda

  // Función para cargar coches desde la API
  const loadCars = async (model = search, pageToLoad = page) => {
    try {
      const { data, total } = await getCars(model, pageToLoad, limit); // Incluye el término de búsqueda
      setCars(data);
      setTotal(total);
    } catch (error) {
      console.error('Error cargando coches:', error);
    }
  };

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

  const handlePageChange = async (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setAnimationClass('animate-fade-out'); // Aplica la animación de desvanecimiento

      setTimeout(async () => {
        await loadCars(search, newPage); // Carga los datos de la nueva página
        setPage(newPage); // Cambia la página
        setAnimationClass('animate-fade-in'); // Aplica la animación de aparición
      }, 500); // Duración de la animación de desvanecimiento
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

  return (
    <Router>
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

                  {/* Centro absoluto: Buscador */}
                  {!showForm && (
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
                    {showForm ? (
                      <button
                        className="btn btn-outline-secondary d-flex align-items-center"
                        onClick={() => setShowForm(false)}
                      >
                        <ArrowLeft className="me-2" />
                        Volver a búsqueda
                      </button>
                    ) : (
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
                  </div>
                </div>
              </nav>
              {/* Contenido */}
              <div className={`content-container mt-5 pt-4 ${animationClass}`}>
                {showForm ? (
                  <div className="form-container animate-bounce">
                    <CarForm onSubmit={handleCreate} editingCar={editingCar} />
                  </div>
                ) : (
                  <div className={`animate-fade-up ${animationClass}`}>
                    {isLoading ? (
                      <div className="text-center my-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                      </div>
                    ) : (
                      <CarList cars={cars} onEdit={handleEdit} onDelete={confirmDelete} />
                    )}
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
      </Routes>
    </Router>
  );
}

export default App;
