import { createContext, useContext, useState, useEffect } from 'react';
import { getCars, getUserFavorites } from '../api';
import { useAuth } from './AuthContext';

const CarsContext = createContext(null);

export function CarsProvider({ children }) {
  const [cars, setCars] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { username, token } = useAuth();

  // Cargar coches
  const loadCars = async (model = "", page = 1, limit = 6) => {
    try {
      setIsLoading(true);
      const response = await getCars(model, page, limit);
      setCars(response.data);
      setTotal(response.total);
      
      return response;
    } catch (error) {
      console.error("Error loading cars:", error);
      return { data: [], total: 0 };
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar favoritos
  const loadFavorites = async () => {
    if (!username || !token) return; // Añadir verificación de token
    
    try {
      const favoritesResponse = await getUserFavorites(token);
      setFavorites(favoritesResponse.carIds || []);
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
    }
  };

  // Actualizar un coche
  const updateCarInState = (updatedCar) => {
    // Verificar que updatedCar tiene una ID válida
    if (!updatedCar || !updatedCar.id) {
      console.error("Error: Intentando actualizar un coche sin ID válida", updatedCar);
      return;
    }

    // Actualizar el estado de manera inmediata
    setCars(prevCars => {
      // Buscar el índice del coche a actualizar
      const index = prevCars.findIndex(car => car.id === updatedCar.id);
      
      // Si el coche existe, actualizarlo; si no, añadirlo
      if (index !== -1) {
        const newCars = [...prevCars];
        newCars[index] = { ...updatedCar };
        return newCars;
      } else {
        // Si el coche no existe, lo añadimos al principio para verlo inmediatamente
        return [updatedCar, ...prevCars];
      }
    });
  };

  // Eliminar un coche
  const deleteCarFromState = (carId) => {
    setCars(prevCars => prevCars.filter(car => car.id !== carId));
  };

  // Actualizar favoritos
  const updateFavorites = (favoriteIds) => {
    setFavorites(favoriteIds);
  };

  // Verificar si un coche es favorito
  const isCarFavorite = (carId) => {
    return favorites.includes(carId);
  };

  // Efectos iniciales
  useEffect(() => {
    if (username) {
      loadFavorites();
    }
  }, [username]);

  return (
    <CarsContext.Provider 
      value={{ 
        cars, 
        setCars,
        total,
        favorites, // Asegurarse de que esto está disponible
        updateFavorites, // Y esta función también
        isCarFavorite,
        isLoading,
        loadCars,
        loadFavorites,
        updateCarInState,
        deleteCarFromState
      }}
    >
      {children}
    </CarsContext.Provider>
  );
}

export const useCars = () => useContext(CarsContext);