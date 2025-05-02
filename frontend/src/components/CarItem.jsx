import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, Edit, Trash, BarChart, MessageSquare, Pencil } from 'lucide-react';
import { addFavorite, removeFavorite, getCarReviews } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCars } from '../context/CarsContext';
import ReviewsModal from './modals/ReviewsModal';

export default function CarItem({ car, index, onEdit, onDelete, onViewSales, onRemoveFavorite }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, token } = useAuth();
  const { isCarFavorite, updateFavorites, favorites } = useCars();
  const [isFavorite, setIsFavorite] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const isInFavoritesPage = location.pathname === '/favorites';
  
  // Nuevo estado para controlar la visibilidad del modal de reseñas
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  useEffect(() => {
    setIsFavorite(isCarFavorite(car.id));
    
    const loadReviews = async () => {
      try {
        const reviewsData = await getCarReviews(car.id);
        if (reviewsData && Array.isArray(reviewsData)) {
          if (reviewsData.length > 0) {
            const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
            setAverageRating(totalRating / reviewsData.length);
            setReviewCount(reviewsData.length);
          }
        } else if (reviewsData && reviewsData.reviews) {
          setAverageRating(reviewsData.avgRating || 0);
          setReviewCount(reviewsData.total || 0);
        }
      } catch (error) {
        console.error("Error al cargar reseñas:", error);
      }
    };
    
    loadReviews();
  }, [car.id, isCarFavorite]);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    
    if (!token) {
      alert("Debes iniciar sesión para añadir favoritos");
      return;
    }

    try {
      if (isFavorite) {
        // Eliminar de favoritos
        const result = await removeFavorite(car.id, token);
        if (result.success) {
          setIsFavorite(false);
          updateFavorites(favorites.filter(id => id !== car.id));
          
          if (isInFavoritesPage && onRemoveFavorite) {
            onRemoveFavorite(car.id);
          }
        }
      } else {
        // Añadir a favoritos
        const result = await addFavorite(car.id, token);
        if (result.success) {
          setIsFavorite(true);
          updateFavorites([...favorites, car.id]);
        }
      }
    } catch (error) {
      console.error("Error al cambiar favorito:", error);
    }
  };

  // Función para renderizar estrellas según la puntuación media
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : 'empty'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  // Función para abrir el modal de reseñas
  const handleOpenReviewsModal = (e) => {
    e.stopPropagation();
    setShowReviewsModal(true);
  };

  return (
    <div className="card car-card position-relative">
      {/* Botón de favoritos */}
      <button 
        className={`btn-favorite ${isFavorite ? 'favorite-active' : ''}`}
        onClick={toggleFavorite}
        aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
        title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
      >
        <Star 
          size={22} 
          fill={isFavorite ? "#FFD700" : "none"} 
          stroke={isFavorite ? "#FFD700" : "currentColor"} 
        />
      </button>

      <div className="card-body">
        <h5 className="card-title">
          {car.make} {car.model} <span className="car-year">{car.year}</span>
        </h5>
        
        {/* Mostrar puntuación media con estrellas */}
        <div className="car-rating mb-2">
          <div className="stars-container">
            {renderStars(Math.round(averageRating))}
            <span className="rating-text ms-2">
              {averageRating > 0 ? 
                `${averageRating.toFixed(1)} (${reviewCount})` : 
                'Sin reseñas'}
            </span>
          </div>
        </div>
        
        <p className="card-text features-preview">
          <strong>Características:</strong> {car.features?.join(', ')}
        </p>

        <div className="d-flex flex-column gap-2">
          <div className="d-flex justify-content-between">
            <button className="btn btn-sm btn-outline-primary w-50" onClick={(e) => {
              e.stopPropagation();
              onEdit(car, index);
            }}>
              <Pencil size={18} /> Editar
            </button>
            <button className="btn btn-sm btn-outline-danger w-50" onClick={(e) => {
              e.stopPropagation();
              onDelete(car);
            }}>
              <Trash size={18} /> Borrar
            </button>
          </div>
          <button
            className="btn btn-sm btn-outline-success w-100"
            onClick={(e) => {
              e.stopPropagation();
              if (onViewSales) {
                onViewSales(car.model);
              } else {
                navigate(`/annual-sales/${car.model}`);
              }
            }}
          >
            <BarChart size={14} />
            <span className="ms-1">Ver Ventas</span>
          </button>
          
          {/* Reemplazar el botón de navegación con un botón para abrir el modal */}
          <button
            className="btn btn-sm btn-outline-info w-100"
            onClick={handleOpenReviewsModal}
          >
            <MessageSquare size={14} />
            <span className="ms-1">Ver reseñas</span>
          </button>
        </div>
      </div>
      
      {/* Modal de reseñas */}
      <ReviewsModal 
        show={showReviewsModal} 
        onHide={() => setShowReviewsModal(false)} 
        carId={car.id}
      />
    </div>
  );
}
