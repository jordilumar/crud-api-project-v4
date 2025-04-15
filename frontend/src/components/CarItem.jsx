import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, Edit, Trash, BarChart, Pencil } from 'lucide-react';
import { addFavorite, removeFavorite } from '../api';

export default function CarItem({ car, index, onEdit, onDelete, onViewSales, onRemoveFavorite }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);
  const username = localStorage.getItem('username'); // Guardamos el username al hacer login
  const isInFavoritesPage = location.pathname === '/favorites';

  // Cargar el estado de favorito desde la API
  useEffect(() => {
    // Solo verificamos los favoritos si hay un usuario logeado
    if (username) {
      const checkIfFavorite = async () => {
        const response = await fetch(`http://localhost:5000/favorites/${username}`);
        const data = await response.json();
        setIsFavorite(data.carIds.includes(car.id));
      };
      
      checkIfFavorite();
    }
  }, [car.id, username]);

  // Añadir este useEffect al componente
  useEffect(() => {
    const handleFavoritesUpdate = (event) => {
      const { favoriteIds } = event.detail;
      // Actualizar el estado del favorito basado en los datos más recientes
      setIsFavorite(favoriteIds.includes(car.id));
    };
    
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, [car.id]);

  // Mejorar la función toggleFavorite para que funcione en cualquier página
  const toggleFavorite = async (e) => {
    e.stopPropagation(); // Evitar que active otros eventos
    e.preventDefault(); // Prevenir comportamiento por defecto
    
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
        const result = await addFavorite(username, car.id);
        if (!result.success) {
          // Si falla, revertimos el cambio visual
          setIsFavorite(false);
          console.error("Error al añadir favorito");
        }
      } else {
        // Si estamos en la página de favoritos, usar la función especial
        if (isInFavoritesPage && onRemoveFavorite) {
          onRemoveFavorite(car.id);
          return; // No continuar con el código regular
        }
        
        // Comportamiento normal para otras páginas
        const result = await removeFavorite(username, car.id);
        if (!result.success) {
          // Si falla, revertimos el cambio visual
          setIsFavorite(true);
          console.error("Error al eliminar favorito");
        }
      }
      
      // Actualizar timestamp de última modificación de favoritos
      localStorage.setItem('lastFavoritesUpdate', Date.now().toString());
      
    } catch (error) {
      // En caso de error, revertimos el cambio visual
      setIsFavorite(!isFavorite);
      console.error("Error al actualizar favorito:", error);
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
