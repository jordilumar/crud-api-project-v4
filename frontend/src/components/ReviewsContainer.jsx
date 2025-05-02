import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReviews, deleteReview } from '../api';
import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';
import { Star } from 'lucide-react';

export default function ReviewsContainer({ carId }) {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    loadReviews();
  }, [carId]);

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
    // Desplazar la vista hasta el formulario
    window.scrollTo({
      top: document.querySelector('.review-form-container').offsetTop - 100,
      behavior: 'smooth'
    });
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
    <div className="reviews-container mt-5">
      <h3 className="mb-4">Reseñas y opiniones</h3>
      
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
        <div className="text-center my-5">
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
      
      <div className="reviews-list">
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
  );
}