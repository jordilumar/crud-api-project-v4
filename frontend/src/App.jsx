import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Search, Car, BarChart, ArrowLeft } from 'lucide-react';
import SalesCharts from './pages/SalesCharts';
import CarForm from './components/CarForm';
import CarList from './components/CarList';
import { useEffect, useState, useRef } from 'react';
import { createCar, updateCar, deleteCar, getCars } from './api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [cars, setCars] = useState([]);
  const [editingCar, setEditingCar] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const searchTimeout = useRef(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 6;

  useEffect(() => {
    loadCars();
  }, [page]);

  const loadCars = async (model = '') => {
    try {
      const { data, total } = await getCars(model, page, limit);
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
      loadCars(text).then(() => {
        setIsSearching(false);
      });
    }, 1000);
  };

  const handleCreate = async (car) => {
    if (editIndex !== null) {
      await updateCar(car.id, car);
      setEditIndex(null);
    } else {
      await createCar(car);
    }
    setEditingCar(null);
    setShowForm(false);
    loadCars(search);
  };

  const handleEdit = (car, index) => {
    setEditingCar(car);
    setEditIndex(index);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('¿Estás seguro de que quieres borrar este coche?');
    if (!confirmed) return;

    await deleteCar(id);
    loadCars(search); // Recargar la lista de coches después de eliminar
  };

  const handleNextPage = () => {
    if (page * limit < total) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
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
                      className="position-absolute start-50 translate-middle-x animate-fade-up"
                      style={{ width: '700px', zIndex: 1 }}
                    >
                      <div className="input-group shadow-sm">
                        <span className="input-group-text bg-light">
                          <Search />
                        </span>
                        <input
                          type="text"
                          className="form-control form-control-lg fw-semibold"
                          style={{ height: '56px', fontSize: '1.1rem' }}
                          placeholder="Buscar por modelo..."
                          value={search}
                          onChange={(e) => handleSearch(e.target.value)}
                        />
                        {isSearching && (
                          <div className="d-flex align-items-center ms-3 animate-fade-in" style={{ animationDuration: '0.4s' }}>
                            <div className="spinner-border text-primary me-2" role="status">
                              <span className="visually-hidden">Buscando...</span>
                            </div>
                            <span className="text-primary fw-medium">Buscando coches...</span>
                          </div>
                        )}
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
                          className="btn btn-outline-primary d-flex align-items-center"
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
                    <CarList cars={cars} onEdit={handleEdit} onDelete={handleDelete} />
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
