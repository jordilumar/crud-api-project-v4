import { useState, useEffect } from 'react';
import { Calendar, Clock, Car, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCars, createBooking } from '../api';
import { Modal, Button } from 'react-bootstrap';

export default function BookingForm({ onBookingCreated }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estados para el formulario
  const [selectedCar, setSelectedCar] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  
  const { token } = useAuth();

  // Cargar los coches disponibles
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        // Obtener todos los coches para seleccionar
        const response = await getCars('', 1, 100);
        if (response && response.data) {
          setCars(response.data);
        }
      } catch (error) {
        console.error("Error cargando coches:", error);
        setError("No se pudieron cargar los coches disponibles");
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Generar las opciones de horas (9:00 AM - 5:00 PM)
  const timeOptions = [];
  for (let hour = 9; hour <= 17; hour++) {
    const formattedHour = hour.toString().padStart(2, '0');
    timeOptions.push(`${formattedHour}:00`);
  }

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCar || !bookingDate || !bookingTime || !returnDate || !returnTime) {
      setErrorMessage("Por favor, complete todos los campos");
      setShowErrorModal(true);
      return;
    }
    
    // Validar que la fecha de devolución sea después de la fecha de recogida
    const pickupDateTime = new Date(`${bookingDate}T${bookingTime}`);
    const returnDateTime = new Date(`${returnDate}T${returnTime}`);
    
    if (returnDateTime <= pickupDateTime) {
      setErrorMessage("La fecha/hora de devolución debe ser posterior a la de recogida");
      setShowErrorModal(true);
      return;
    }
    
    try {
      const bookingData = {
        car_id: parseInt(selectedCar),
        date: bookingDate,
        time: bookingTime,
        return_date: returnDate,
        return_time: returnTime
      };
      
      console.log("Enviando datos de reserva:", bookingData);
      const result = await createBooking(bookingData, token);
      console.log("Resultado de la creación:", result);
      
      // Mostrar mensaje de éxito
      setSuccess(true);
      
      // Resetear formulario
      setSelectedCar('');
      setBookingDate('');
      setBookingTime('');
      setReturnDate('');
      setReturnTime('');
      
      // Notificar al componente padre
      if (onBookingCreated) {
        onBookingCreated();
      }
    } catch (error) {
      console.error("Error en formulario:", error);
      setErrorMessage(error.message || "Error al crear la reserva");
      setShowErrorModal(true);
    }
  };

  // Encontrar el nombre del coche seleccionado
  const selectedCarDetails = cars.find(car => car.id.toString() === selectedCar.toString());
  const selectedCarName = selectedCarDetails ? `${selectedCarDetails.make} ${selectedCarDetails.model}` : '';

  return (
    <div className="booking-form-container">
      <h4 className="mb-4">
        <Calendar className="me-2" size={22} />
        Reservar un coche
      </h4>
      
      {loading ? (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando coches disponibles...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <form onSubmit={handleSubmit} className="card shadow-sm p-4">
          {success && (
            <div className="alert alert-success mb-4">
              ¡Reserva creada exitosamente!
            </div>
          )}
          
          <div className="form-group mb-3">
            <label htmlFor="car-select" className="form-label">
              <Car size={18} className="me-2" />
              Selecciona un coche
            </label>
            <select 
              id="car-select"
              className="form-select" 
              value={selectedCar}
              onChange={(e) => setSelectedCar(e.target.value)}
              required
            >
              <option value="">-- Selecciona un coche --</option>
              {cars.map(car => (
                <option key={car.id} value={car.id}>
                  {car.make} {car.model} ({car.year})
                </option>
              ))}
            </select>
          </div>
          
          <div className="row">
            <div className="col-md-6">
              <h5 className="mb-3 text-primary">Recogida del coche</h5>
              <div className="form-group mb-3">
                <label htmlFor="booking-date" className="form-label">
                  <Calendar size={18} className="me-2" />
                  Fecha de recogida
                </label>
                <input 
                  type="date" 
                  id="booking-date"
                  className="form-control" 
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={today}
                  required
                />
              </div>
              
              <div className="form-group mb-4">
                <label htmlFor="booking-time" className="form-label">
                  <Clock size={18} className="me-2" />
                  Hora de recogida
                </label>
                <select 
                  id="booking-time"
                  className="form-select" 
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  required
                >
                  <option value="">-- Selecciona una hora --</option>
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="col-md-6">
              <h5 className="mb-3 text-success">Devolución del coche</h5>
              <div className="form-group mb-3">
                <label htmlFor="return-date" className="form-label">
                  <Calendar size={18} className="me-2" />
                  Fecha de devolución
                </label>
                <input 
                  type="date" 
                  id="return-date"
                  className="form-control" 
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={bookingDate || today}
                  required
                />
              </div>
              
              <div className="form-group mb-4">
                <label htmlFor="return-time" className="form-label">
                  <Clock size={18} className="me-2" />
                  Hora de devolución
                </label>
                <select 
                  id="return-time"
                  className="form-select" 
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  required
                >
                  <option value="">-- Selecciona una hora --</option>
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {selectedCar && bookingDate && bookingTime && returnDate && returnTime && (
            <div className="reservation-summary alert alert-info mb-4">
              <strong>Resumen de reserva:</strong> {selectedCarName}
              <br />
              <span className="text-primary">
                <Calendar size={16} className="me-1" /> Recogida: {bookingDate} a las {bookingTime}
              </span>
              <br />
              <span className="text-success">
                <Calendar size={16} className="me-1" /> Devolución: {returnDate} a las {returnTime}
              </span>
            </div>
          )}
          
          <button type="submit" className="btn btn-primary w-100">
            <Calendar className="me-2" size={18} />
            Confirmar reserva
          </button>
        </form>
      )}
      
      {/* Modal de Error */}
      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Error en la Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>{errorMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowErrorModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}