import { useState, useRef, useEffect } from 'react';
import { getCars, createCar, updateCar, deleteCar } from '../api';
import { useCars } from '../context/CarsContext';

export default function useCarManagement(initialLimit = 6) {
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = initialLimit;
  const searchTimeout = useRef(null);
  
  const { loadCars: loadCarsFromContext, updateCarInState, deleteCarFromState } = useCars();

  const fetchCars = async (model = search, pageToLoad = page) => {
    try {
      setIsLoading(true);
      const response = await getCars(model, pageToLoad, limit);
      
      if (response && response.data) {
        setCars(response.data);
        setTotal(response.total);
      } else {
        console.error("Respuesta de API sin datos:", response);
        setCars([]);
      }
    } catch (error) {
      console.error("Error cargando coches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    setIsSearching(true);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchCars(text);
      setIsSearching(false);
    }, 1000);
  };

  useEffect(() => {
    loadCarsFromContext(search);
  }, [page, search]);

  useEffect(() => {
    fetchCars(search);
  }, []);

  return {
    cars,
    setCars,
    search,
    setSearch,
    isSearching,
    isLoading, 
    page,
    setPage,
    total,
    limit,
    fetchCars,
    handleSearch,
    updateCarInState,
    deleteCarFromState
  };
}