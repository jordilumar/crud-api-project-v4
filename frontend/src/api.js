// src/api.js
const API_URL = '';

export const getCars = async (model = '', page = 1, limit = 5) => {
  const params = new URLSearchParams({ model, page, limit });
  const res = await fetch(`/cars?${params.toString()}`);
  return await res.json();
};

export const createCar = async (car) => {
  await fetch('/cars', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(car),
  });
};

export const updateCar = async (index, car) => {
  await fetch(`/cars/${index}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(car),
  });
};

export const deleteCar = async (index) => {
  await fetch(`/cars/${index}`, { method: 'DELETE' });
};

export async function getSales({ model, country, year, page = 1, limit = 5 }) {
  const params = new URLSearchParams({ model, country, year, page, limit });
  const response = await fetch(`/sales?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Error al obtener ventas");
  }
  return response.json();
}

// Función auxiliar para agregar autenticación a las peticiones
export const authHeaders = () => {
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token'); // Ahora esto es solo un indicador
  
  if (username && token) {
    // En un sistema real, guardarías también la contraseña o un token real
    // Esto es solo un ejemplo simplificado
    return {
      'Authorization': `Basic ${btoa(`${username}:dummyPassword`)}`,
      'Content-Type': 'application/json'
    };
  }
  return { 'Content-Type': 'application/json' };
};

// Funciones para gestionar favoritos
export const getUserFavorites = async (username) => {
  try {
    const response = await fetch(`http://localhost:5000/favorites/${username}`, {
      headers: authHeaders()
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return { carIds: [] };
  }
};

export const addFavorite = async (username, carId) => {
  try {
    const response = await fetch(`http://localhost:5000/favorites/${username}/add/${carId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error al añadir favorito:", error);
    return { success: false };
  }
};

export const removeFavorite = async (username, carId) => {
  try {
    const response = await fetch(`http://localhost:5000/favorites/${username}/remove/${carId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
    return { success: false };
  }
};