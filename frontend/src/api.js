
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
// La mejor solución es pasar el contexto como parámetro
export const authHeaders = (username, token) => {
  if (username && token) {
    return {
      'Authorization': `Basic ${btoa(`${username}:dummyPassword`)}`,
      'Content-Type': 'application/json'
    };
  }
  return { 'Content-Type': 'application/json' };
};

// Funciones para gestionar favoritos
export const getUserFavorites = async (username, token) => {
  try {
    const response = await fetch(`http://localhost:5000/favorites/${username}`, {
      headers: authHeaders(username, token)
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

export const addFavorite = async (username, carId, token) => {
  try {
    const response = await fetch(`http://localhost:5000/favorites/${username}/add/${carId}`, {
      method: 'POST',
      headers: authHeaders(username, token)
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

export const removeFavorite = async (username, carId, token) => {
  try {
    const response = await fetch(`http://localhost:5000/favorites/${username}/remove/${carId}`, {
      method: 'DELETE',
      headers: authHeaders(username, token)
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