import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { getCar } from '../api';
import ReviewsContainer from '../components/ReviewsContainer';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function CarDetail() {
  const { carId } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token, username, logout } = useAuth();

  useEffect(() => {
    fetchCarDetails();
  }, [carId]);

  const fetchCarDetails = async () => {
    setLoading(true);
    try {
      const carData = await getCar(parseInt(carId));
      setCar(carData);
    } catch (error) {
      console.error("Error al cargar detalles del coche", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="car-detail-page">
      <Navbar 
        token={token}
        username={username}
        onLogout={handleLogout}
        onProfileClick={() => {/* Manejar clic en perfil */}}
        onNavigateToSales={() => navigate("/annual-sales")}
      />

      <div className="container py-4">
        <button 
          className="btn btn-link text-decoration-none mb-4 d-inline-flex align-items-center"
          onClick={() => navigate('/')}
        >
          <ChevronLeft size={20} className="me-1" /> Volver
        </button>
        
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <div className="mt-2">Cargando detalles del coche...</div>
          </div>
        ) : car ? (
          <>
            <div className="car-details card mb-5">
              <div className="card-body">
                <h2 className="card-title mb-3">{car.make} {car.model} ({car.year})</h2>
                
                {car.features && car.features.length > 0 && (
                  <div className="mb-4">
                    <h5>Características:</h5>
                    <ul className="list-group">
                      {car.features.map((feature, index) => (
                        <li key={index} className="list-group-item">{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <ReviewsContainer carId={parseInt(carId)} />
          </>
        ) : (
          <div className="alert alert-warning">
            No se pudo encontrar información sobre este coche.
          </div>
        )}
      </div>
    </div>
  );
}