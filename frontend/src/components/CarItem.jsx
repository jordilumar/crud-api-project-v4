import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, Edit, Trash, BarChart, Pencil } from 'lucide-react';
import { addFavorite, removeFavorite } from '../api';
import { useAuth } from '../context/AuthContext'; // Añadir esta importación
import { useCars } from '../context/CarsContext';

export default function CarItem({ car, index, onEdit, onDelete, onViewSales, onRemoveFavorite }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, token } = useAuth();
  const { isCarFavorite, updateFavorites, favorites } = useCars();
  const [isFavorite, setIsFavorite] = useState(false);
  const isInFavoritesPage = location.pathname === '/favorites';

  // Usar el estado del contexto en lugar de cargar por separado
  useEffect(() => {
    setIsFavorite(isCarFavorite(car.id));
  }, [car.id, isCarFavorite]);

  // Modificar toggleFavorite para usar el contexto
  const toggleFavorite = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Si no hay usuario logeado, mostramos un mensaje
    if (!username) {
      alert('Debes iniciar sesión para guardar favoritos');
      return;
    }
    
    try {
      // Cambiar de manera optimista el estado local para mejorar UX
      const newState = !isFavorite;
      setIsFavorite(newState);
      
      // Enviar la actualización al servidor
      if (newState) {
        const result = await addFavorite(car.id, token);
        if (result.success) {
          // Actualizar el contexto global después de añadir el favorito
          updateFavorites([...favorites, car.id]);
        } else {
          setIsFavorite(false);
          console.error("Error al añadir favorito");
        }
      } else {
        // Si estamos en la página de favoritos, usar la función especial
        if (isInFavoritesPage && onRemoveFavorite) {
          onRemoveFavorite(car.id);
          return; // No continuar con el código regular
        }
        
        const result = await removeFavorite(car.id, token);
        if (result.success) {
          // Actualizar el contexto global después de eliminar el favorito
          updateFavorites(favorites.filter(id => id !== car.id));
        } else {
          setIsFavorite(true);
          console.error("Error al eliminar favorito");
        }
      }
    } catch (error) {
      console.error("Error al actualizar favorito", error);
      // En caso de error, revertimos el cambio visual
      setIsFavorite(!isFavorite);
    }
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
        <p className="card-text features-preview">
          <strong>Características:</strong> {car.features?.join(', ')}
        </p>

        <div className="d-flex flex-column gap-2">
          <div className="d-flex justify-content-between">
            <button className="btn btn-sm btn-outline-primary w-50" onClick={() => onEdit(car, index)}>
              <Pencil size={18} />  Editar
            </button>
            <button className="btn btn-sm btn-outline-danger w-50" onClick={() => onDelete(car)}>
              <Trash size={18} /> Borrar
            </button>
          </div>
          <button
            className="btn btn-sm btn-outline-success w-100"
            onClick={() => {
              // Si nos pasaron una función específica para ver ventas, la usamos
              if (onViewSales) {
                onViewSales(car.model);
              } else {
                // Comportamiento por defecto (igual que antes)
                navigate(`/annual-sales/${car.model}`);
              }
            }}
          >
            <BarChart size={16} className="me-1" />
            Ver Ventas
          </button>
        </div>
      </div>
    </div>
  );
}
