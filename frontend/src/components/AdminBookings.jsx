import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, Car, User, AlertCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAllBookings, getCar } from '../api';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carDetails, setCarDetails] = useState({});
  const [search, setSearch] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);
  
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadAllBookings();
  }, [token]);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredBookings(bookings);
    } else {
      const searchLower = search.toLowerCase();
      setFilteredBookings(bookings.filter(booking => {
        const car = carDetails[booking.car_id];
        if (!car) return false;
        
        return (
          car.make.toLowerCase().includes(searchLower) ||
          car.model.toLowerCase().includes(searchLower) ||
          booking.date.includes(searchLower) ||
          booking.time.includes(searchLower)
        );
      }));
    }
  }, [search, bookings, carDetails]);

  const loadAllBookings = async () => {
    try {
      setIsLoading(true);
      
      if (!token) {
        navigate('/');
        return;
      }
      
      const { bookings: bookingsData, error: apiError } = await getAllBookings(token);
      
      if (apiError && apiError.includes('Acceso denegado')) {
        setAccessDenied(true);
        return;
      }
      
      // Ordenar reservas por fecha (más recientes primero)
      bookingsData.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB - dateA;
      });
      
      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
      
      // Cargar detalles de cada coche
      await loadCarDetails(bookingsData);
      
    } catch (error) {
      console.error("Error al cargar reservas:", error);
      setError("No se pudieron cargar las reservas");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCarDetails = async (bookingsData) => {
    const carDetailsMap = {};
    
    for (const booking of bookingsData) {
      if (!carDetailsMap[booking.car_id]) {
        try {
          const car = await getCar(booking.car_id);
          if (car) {
            carDetailsMap[booking.car_id] = car;
          }
        } catch (error) {
          console.error(`Error al cargar detalles del coche ${booking.car_id}:`, error);
        }
      }
    }
    
    setCarDetails(carDetailsMap);
  };

  // Formatear fecha para mostrar
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (accessDenied) {
    return (
      <div className="container mt-5 pt-5">
        <div className="alert alert-danger">
          <AlertCircle size={24} className="me-2" />
          <strong>Acceso Denegado:</strong> Necesitas permisos de administrador para ver esta página.
        </div>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => navigate('/')}
        >
          <ChevronLeft size={20} className="me-1" /> Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="admin-bookings-container">
      <div className="admin-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Volver
        </button>
        <h2>Administración de Reservas</h2>
      </div>
      
      {isLoading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <div className="mt-2">Cargando todas las reservas...</div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <AlertCircle size={20} className="me-2" />
          {error}
        </div>
      ) : (
        <>
          {/* Buscador */}
          <div className="mb-4">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <Search size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control search-bar"
                placeholder="Buscar por modelo, fecha..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          {filteredBookings.length === 0 ? (
            <div className="alert alert-info">
              <Calendar size={20} className="me-2" />
              No hay reservas que coincidan con tu búsqueda.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-primary">
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Coche</th>
                    <th>Usuario</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(booking => {
                    const car = carDetails[booking.car_id];
                    const isPastBooking = new Date(`${booking.date}T${booking.time}`) < new Date();
                    
                    return (
                      <tr key={booking.id}>
                        <td>{formatDate(booking.date)}</td>
                        <td>{booking.time}</td>
                        <td>
                          {car ? (
                            <span><Car size={16} className="me-1" /> {car.make} {car.model}</span>
                          ) : (
                            'Coche no disponible'
                          )}
                        </td>
                        <td>
                          <User size={16} className="me-1" />
                          Usuario #{booking.user_id}
                        </td>
                        <td>
                          <span className={`badge ${isPastBooking ? 'bg-secondary' : 'bg-success'}`}>
                            {isPastBooking ? 'Finalizada' : 'Activa'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}