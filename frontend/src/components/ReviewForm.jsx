import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Star } from 'lucide-react';
import { addReview, updateReview } from '../api';

export default function ReviewForm({ carId, onReviewAdded, editingReview = null, onCancel = null }) {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  // Cuando editingReview cambia, actualizar el formulario
  useEffect(() => {
    if (editingReview) {
      setText(editingReview.text);
      setRating(editingReview.rating);
    } else {
      setText('');
      setRating(0);
    }
  }, [editingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (rating === 0) {
      setError('Por favor, selecciona una puntuación');
      return;
    }
    
    if (text.trim().length < 5) {
      setError('La reseña debe tener al menos 5 caracteres');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      let response;
      
      // Si estamos editando una reseña existente
      if (editingReview) {
        response = await updateReview(
          editingReview.id,
          { text, rating },
          token
        );
      } else {
        // Si estamos creando una nueva reseña
        response = await addReview(
          { car_id: carId, text, rating },
          token
        );
      }
      
      if (response.success) {
        setText('');
        setRating(0);
        onReviewAdded(response.review);
        if (editingReview && onCancel) {
          onCancel();
        }
      } else {
        setError('Error al guardar la reseña');
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-form-container p-3 border rounded">
      <h5 className="mb-3">
        {editingReview ? 'Editar reseña' : 'Escribir una reseña'}
      </h5>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Tu puntuación</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={24}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                fill={(hoverRating || rating) >= star ? "#FFD700" : "none"}
                stroke={(hoverRating || rating) >= star ? "#FFD700" : "currentColor"}
                style={{ cursor: 'pointer', marginRight: '5px' }}
              />
            ))}
          </div>
        </div>
        
        <div className="mb-3">
          <label htmlFor="reviewText" className="form-label">Tu opinión</label>
          <textarea
            className="form-control"
            id="reviewText"
            rows="3"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          ></textarea>
        </div>
        
        <div className="d-flex justify-content-between">
          {editingReview && onCancel && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          )}
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Guardando...
              </>
            ) : editingReview ? 'Actualizar reseña' : 'Publicar reseña'}
          </button>
        </div>
      </form>
    </div>
  );
}