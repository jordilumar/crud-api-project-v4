import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, Edit, Trash, Check, AlertCircle } from 'lucide-react';
import { Modal, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext'; // Añadir esta importación
import { useCars } from '../context/CarsContext';
import CarList from './CarList';
import CarForm from './CarForm';
import CarItem from './CarItem';
import { getCars, getUserFavorites, updateCar, deleteCar, removeFavorite } from '../api';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { username, token } = useAuth(); // Usar contexto en lugar de localStorage
  const { updateCarInState, deleteCarFromState, updateFavorites, favorites: globalFavorites } = useCars();
  
  // Resto de estados
  const [animatingCars, setAnimatingCars] = useState({});
  const [editingCar, setEditingCar] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    loadFavorites();
  }, [navigate, username]);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      
      // Si no hay usuario logeado, redirigimos a la página principal
      if (!token) {
        navigate('/');
        return;
      }
      
      // Ya no pasamos el username, solo el token
      const favoritesResponse = await getUserFavorites(token);
      const favoriteIds = favoritesResponse.carIds;
      
      if (favoriteIds.length === 0) {
        setFavorites([]);
        setIsLoading(false);
        return;
      }
      
      // Primero obtener el conteo total de coches
      const countResponse = await getCars('', 1, 1);
      const totalCars = countResponse.total;

      // Luego hacer la solicitud con el número exacto de coches
      const carsResponse = await getCars('', 1, totalCars);
      const allCars = carsResponse.cars || carsResponse.data;
      
      // Filtramos para obtener solo los favoritos
      const favoriteCars = allCars.filter(car => favoriteIds.includes(car.id));
      setFavorites(favoriteCars);
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejadores para acciones directas en la página de favoritos
  const handleEdit = (car) => {
    // En lugar de redirigir, abrimos un modal de edición aquí
    setEditingCar(car);
    setShowEditForm(true);
  };

  const handleEditSubmit = async (updatedCar) => {
    try {
      await updateCar(updatedCar.id, updatedCar);
      updateCarInState(updatedCar); // Usar función del contexto
      setShowEditForm(false);
      setEditingCar(null);
      
      // Actualizar la lista de favoritos para reflejar los cambios
      await loadFavorites();
      
      setModalMessage('Coche actualizado correctamente');
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error al actualizar el coche:", error);
      setModalMessage('Error al actualizar el coche');
      setShowErrorModal(true);
    }
  };

  const confirmDelete = (car) => {
    setCarToDelete(car);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!carToDelete) return;
    
    try {
      await deleteCar(carToDelete.id);
      deleteCarFromState(carToDelete.id); // Usar función del contexto
      
      setShowDeleteModal(false);
      setCarToDelete(null);
      await loadFavorites(); // Recargar favoritos
      
      setModalMessage('Coche eliminado correctamente');
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error al eliminar el coche:", error);
      setModalMessage('Error al eliminar el coche');
      setShowErrorModal(true);
    }
  };

  // Función para ver ventas sin salir de favoritos
  const handleViewSales = (model) => {
    // Navegamos a la página de ventas pero usamos el parámetro de estado
    // para indicar que debe volver a favoritos cuando termine
    navigate(`/annual-sales/${model}`, { state: { returnToFavorites: true } });
  };

  // Actualiza la función handleRemoveFavorite para usar el contexto
  const handleRemoveFavorite = async (carId) => {
    try {
      // 1. Iniciar la animación
      setAnimatingCars(prev => ({ ...prev, [carId]: true }));
      
      // 2. Hacer la llamada API inmediatamente (sin esperar)
      const resultPromise = removeFavorite(carId, token);
      
      // 3. Esperar el tiempo mínimo para la animación (en paralelo)
      const animationPromise = new Promise(resolve => setTimeout(resolve, 400));
      
      // 4. Esperar a que ambas operaciones terminen
      const [result] = await Promise.all([resultPromise, animationPromise]);
      
      if (result.success) {
        // Actualizar el estado local
        setFavorites(prevFavs => prevFavs.filter(car => car.id !== carId));
        
        // Actualizar el contexto global de favoritos
        updateFavorites(globalFavorites.filter(id => id !== carId));
        
        // Limpiar estado de animación
        setTimeout(() => {
          setAnimatingCars(prev => {
            const newState = { ...prev };
            delete newState[carId];
            return newState;
          });
        }, 100);
      } else {
        setAnimatingCars(prev => {
          const newState = { ...prev };
          delete newState[carId];
          return newState;
        });
      }
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
      setAnimatingCars(prev => {
        const newState = { ...prev };
        delete newState[carId];
        return newState;
      });
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <Star className="me-2" fill="#FFD700" stroke="#FFD700" /> 
          Mis Coches Favoritos
        </h2>
        <button 
          className="btn btn-outline-primary"
          onClick={() => navigate('/')}
        >
          <ChevronLeft size={18} className="me-1" /> Volver
        </button>
      </div>

      {favorites.length === 0 && !isLoading ? (
        <div className="alert alert-info">
          No has marcado ningún coche como favorito. Vuelve al garaje y marca algunos coches con la estrella.
        </div>
      ) : (
        <div className="car-grid">
          {favorites.map((car, index) => (
            <div 
              key={car.id} 
              className={`car-item-container ${animatingCars[car.id] ? 'animate-fade-out' : ''}`}
            >
              <CarItem
                car={car}
                index={index}
                onEdit={handleEdit}
                onDelete={confirmDelete}
                onViewSales={handleViewSales}
                onRemoveFavorite={handleRemoveFavorite}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Modal de confirmación de eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar el coche <strong>{carToDelete?.make} {carToDelete?.model}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal de edición de coche */}
      <Modal show={showEditForm} onHide={() => setShowEditForm(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Coche</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingCar && (
            <CarForm 
              onSubmit={handleEditSubmit} 
              editingCar={editingCar}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Modal de éxito */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title><Check className="me-2" size={24} /> Operación Exitosa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalMessage}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={() => setShowSuccessModal(false)}>
            Aceptar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de error */}
      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title><AlertCircle className="me-2" size={24} /> Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalMessage}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowErrorModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}