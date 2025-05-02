import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, Car, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBookings, deleteBooking, getCar } from '../api';
import { Modal, Button } from 'react-bootstrap';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [carDetails, setCarDetails] = useState({});
  const [loading, setLoading] = useState(true); // Estado de carga añadido
  
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
  }, [token]);

  const loadBookings = async () => {
    // Iniciar carga
    setLoading(true);
    
    // Registrar tiempo de inicio para asegurar duración mínima
    const startTime = Date.now();
    
    try {
      if (!token) {
        navigate('/');
        return;
      }
      
      const bookingsData = await getBookings(token);
      
      // Ordenar reservas por fecha (más recientes primero)
      bookingsData.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB - dateA;
      });
      
      setBookings(bookingsData);
      
      // Cargar detalles de cada coche
      await loadCarDetails(bookingsData);
      
      // Calcular el tiempo transcurrido
      const elapsedTime = Date.now() - startTime;
      
      // Si la carga fue más rápida que 600ms, esperar el tiempo restante
      if (elapsedTime < 600) {
        await new Promise(resolve => setTimeout(resolve, 600 - elapsedTime));
      }
      
    } catch (error) {
      console.error("Error al cargar reservas:", error);
      setError("No se pudieron cargar tus reservas");
    } finally {
      // Finalizar carga después del tiempo mínimo
      setLoading(false);
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

  const confirmDelete = (booking) => {
    setBookingToDelete(booking);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!bookingToDelete) return;
    
    try {
      await deleteBooking(bookingToDelete.id, token);
      
      // Actualizar la lista de reservas
      setBookings(prevBookings => 
        prevBookings.filter(b => b.id !== bookingToDelete.id)
      );
      
      setShowDeleteModal(false);
      setBookingToDelete(null);
      
    } catch (error) {
      console.error("Error al eliminar reserva:", error);
      setError("No se pudo eliminar la reserva");
    }
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

  return (
    <div className="my-bookings-container">
      <div className="my-bookings-header">
        <button 
          className="btn-back"
          onClick={() => navigate('/')}
        >
          <ChevronLeft size={18} />
          Volver
        </button>
        <h2>Mis Reservas</h2>
      </div>
      
      <div className="my-bookings-container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando reservas...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">
            <AlertCircle size={20} className="me-2" />
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="no-bookings">
            <Calendar size={40} />
            <p className="no-bookings-text">No tienes reservas activas. ¡Reserva un coche ahora!</p>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
              Hacer una reserva
            </button>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map(booking => {
              const car = carDetails[booking.car_id];
              const isPastBooking = new Date(`${booking.date}T${booking.time}`) < new Date();
              
              return (
                <div key={booking.id} className="booking-card">
                  <div className="booking-date">
                    <p className="booking-date-text">{formatDate(booking.date)}</p>
                  </div>
                  
                  <div className="car-info">
                    <h3 className="car-model">
                      {car ? `${car.make} ${car.model}` : 'Coche no disponible'}
                    </h3>
                    {car && <span className="car-year">{car.year}</span>}
                  </div>
                  
                  <div className="booking-times">
                    <div className="pickup-info">
                      <div className="time-label">
                        <Calendar size={16} />
                        <span>Recogida</span>
                      </div>
                      <div className="time-value">
                        {booking.date} - {booking.time}
                      </div>
                    </div>
                    
                    <div className="return-info">
                      <div className="time-label">
                        <Calendar size={16} />
                        <span>Devolución</span>
                      </div>
                      <div className="time-value">
                        {booking.return_date} - {booking.return_time}
                      </div>
                    </div>
                  </div>
                  
                  {!isPastBooking && (
                    <div className="booking-card-footer">
                      <button 
                        className="btn-cancel" 
                        onClick={() => confirmDelete(booking)}
                      >
                        <Trash2 size={16} />
                        Cancelar reserva
                      </button>
                    </div>
                  )}
                  
                  {isPastBooking && (
                    <div className="booking-card-footer">
                      <span className="badge bg-secondary">Reserva finalizada</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Modal de Confirmación para Eliminar */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancelar Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bookingToDelete && (
            <p>
              ¿Estás seguro de que deseas cancelar tu reserva del{' '}
              <strong>{formatDate(bookingToDelete.date)}</strong> a las{' '}
              <strong>{bookingToDelete.time}</strong>?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Confirmar Cancelación
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}