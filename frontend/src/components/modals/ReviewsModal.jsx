import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Star, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getReviews, deleteReview, getCar } from '../../api';
import ReviewForm from '../ReviewForm';
import ReviewItem from '../ReviewItem';

export default function ReviewsModal({ show, onHide, carId }) {
  const [car, setCar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const { token, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('details'); // 'details' o 'reviews'

  useEffect(() => {
    if (show && carId) {
      loadCarDetails();
      loadReviews();
    }
  }, [show, carId]);

  const loadCarDetails = async () => {
    try {
      const carData = await getCar(carId);
      setCar(carData);
    } catch (error) {
      console.error("Error al cargar detalles del coche", error);
    }
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await getReviews(carId);
      setReviews(data.reviews || []);
      setAvgRating(data.avgRating || 0);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error al cargar reseñas", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAdded = (newReview) => {
    if (editingReview) {
      // Si estábamos editando, reemplazar la reseña
      setReviews(reviews.map(review => 
        review.id === newReview.id ? newReview : review
      ));
      setEditingReview(null);
    } else {
      // Si es una nueva reseña, añadirla al principio
      setReviews([newReview, ...reviews]);
    }
    
    // Recalcular la puntuación media
    loadReviews();
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    // Scroll al formulario de edición
    setTimeout(() => {
      const formContainer = document.querySelector('.review-form-container');
      if (formContainer) {
        formContainer.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleDelete = async (reviewId) => {
    try {
      const result = await deleteReview(reviewId, token);
      if (result.success) {
        // Eliminar la reseña de la lista
        setReviews(reviews.filter(review => review.id !== reviewId));
        // Recalcular la puntuación media
        loadReviews();
      }
    } catch (error) {
      console.error("Error al eliminar la reseña", error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {car ? `${car.make} ${car.model} (${car.year})` : 'Cargando...'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {car && (
          <div>
            {/* Pestañas de navegación */}
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  Detalles del coche
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reseñas y opiniones {total > 0 && `(${total})`}
                </button>
              </li>
            </ul>

            {/* Contenido de la pestaña de detalles */}
            {activeTab === 'details' && (
              <div className="car-details-tab">
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
            )}

            {/* Contenido de la pestaña de reseñas */}
            {activeTab === 'reviews' && (
              <div className="reviews-tab">
                {!loading && (
                  <div className="rating-summary d-flex align-items-center mb-4">
                    <div className="display-4 me-3">{avgRating.toFixed(1)}</div>
                    <div>
                      <div className="star-rating mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={24}
                            fill={avgRating >= star ? "#FFD700" : "none"}
                            stroke={avgRating >= star ? "#FFD700" : "#aaa"}
                          />
                        ))}
                      </div>
                      <div className="text-muted">
                        Basado en {total} {total === 1 ? 'opinión' : 'opiniones'}
                      </div>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="text-center my-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <div className="mt-2">Cargando reseñas...</div>
                  </div>
                )}

                {isAuthenticated && (
                  <div className="mb-4">
                    <ReviewForm 
                      carId={carId}
                      onReviewAdded={handleReviewAdded}
                      editingReview={editingReview}
                      onCancel={editingReview ? () => setEditingReview(null) : null}
                    />
                  </div>
                )}

                {!loading && reviews.length === 0 && (
                  <div className="alert alert-info">
                    No hay reseñas para este coche. ¡Sé el primero en opinar!
                  </div>
                )}

                <div className="reviews-list" style={{maxHeight: '400px', overflowY: 'auto'}}>
                  {reviews.map(review => (
                    <ReviewItem
                      key={review.id}
                      review={review}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}