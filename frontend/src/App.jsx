import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Search, Car, BarChart, ArrowLeft } from 'lucide-react';
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


  // Efecto para recargar coches al cambiar de página
  useEffect(() => {
    loadCars(search); // Carga los coches con el término de búsqueda actual
  }, [page, search]); // Ejecuta este efecto cuando cambie la página o el término de búsqueda

  // Función para cargar coches desde la API
  const loadCars = async (model = search) => {
    try {
      const { data, total } = await getCars(model, page, limit); // Incluye el término de búsqueda
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
      } else {
        await createCar(car);
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
        console.error("Error al crear el coche:", errorMessage.error);
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

  const handleNextPage = () => {
    if (page * limit < total) {
      setTimeout(() => {
        setPage((prevPage) => prevPage + 1);
        loadCars(search); // Carga los coches con el término de búsqueda actual
      }, 400);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setTimeout(() => {
        setPage((prevPage) => prevPage - 1);
        loadCars(search); // Carga los coches con el término de búsqueda actual
      }, 400);
    }
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
              <div className="content-container mt-5 pt-4 animate-fade-up">
                {showForm ? (
                  <div className="form-container animate-bounce">
                    <CarForm onSubmit={handleCreate} editingCar={editingCar} />
                  </div>
                ) : (
                  <div className="animate-fade-up">
                    <CarList cars={cars} onEdit={handleEdit} onDelete={confirmDelete}/>
                    {/* Botones para cambiar de pagina */}
                    <div className="pagination animate-slide-in-bottom">
                      <button onClick={handlePrevPage} disabled={page === 1}>
                        Anterior
                      </button>
                      <span>Página {page}</span>
                      <button onClick={handleNextPage} disabled={page * limit >= total}>
                        Siguiente
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
            </div>
          }
        />
        <Route path="/sales/:model" element={<SalesCharts />} />
        <Route 
          path="/annual-sales" 
          element={<SalesCharts initialViewAnnualSales={true}/>} />

      </Routes>
    </Router>
  );
}

export default App;
