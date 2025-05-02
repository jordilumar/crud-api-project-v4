import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Star, Edit, Trash, X } from 'lucide-react';

export default function ReviewItem({ review, onEdit, onDelete }) {
  const { username } = useAuth();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // Comprobar si el usuario actual es el autor de la reseña
  const isAuthor = username === review.username;
  
  // Formatear la fecha
  const formattedDate = new Date(review.date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div className="review-item mb-4 p-3 border-bottom">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="d-flex align-items-center mb-2">
            <h6 className="mb-0 me-2">{review.username}</h6>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  fill={review.rating >= star ? "#FFD700" : "none"}
                  stroke={review.rating >= star ? "#FFD700" : "#aaa"}
                />
              ))}
            </div>
          </div>
          <div className="text-muted small">{formattedDate}</div>
        </div>
        
        {isAuthor && !showConfirmDelete && (
          <div>
            <button
              className="btn btn-sm btn-outline-secondary me-1"
              onClick={() => onEdit(review)}
              title="Editar reseña"
            >
              <Edit size={16} />
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => setShowConfirmDelete(true)}
              title="Eliminar reseña"
            >
              <Trash size={16} />
            </button>
          </div>
        )}
        
        {isAuthor && showConfirmDelete && (
          <div className="d-flex">
            <div className="me-2">
              <strong>¿Eliminar esta reseña?</strong>
            </div>
            <button
              className="btn btn-sm btn-danger me-1"
              onClick={() => {
                onDelete(review.id);
                setShowConfirmDelete(false);
              }}
            >
              Sí
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setShowConfirmDelete(false)}
            >
              No
            </button>
          </div>
        )}
      </div>
      
      <div className="review-text mt-2">
        {review.text}
      </div>
    </div>
  );
}