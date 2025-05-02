// src/api.js
const API_URL = '';

export const getCars = async (model = '', page = 1, limit = 5) => {
  const params = new URLSearchParams({ model, page, limit });
  const res = await fetch(`/cars?${params.toString()}`);
  return await res.json();
};

export const createCar = async (car) => {
  const response = await fetch('/cars', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(car),
  });
  return await response.json(); // Return the created car with server-generated ID
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
export const authHeaders = (token) => {
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
  return { 'Content-Type': 'application/json' };
};

// Funciones para gestionar favoritos - Ya no incluimos username en la URL
export const getUserFavorites = async (token) => {
  try {
    const response = await fetch(`http://localhost:5000/favorites`, {
      headers: authHeaders(token)
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

export const addFavorite = async (carId, token) => {
  try {
    const response = await fetch(`http://localhost:5000/favorites/add/${carId}`, {
      method: 'POST',
      headers: authHeaders(token)
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

export const removeFavorite = async (carId, token) => {
  try {
    const response = await fetch(`http://localhost:5000/favorites/remove/${carId}`, {
      method: 'DELETE',
      headers: authHeaders(token)
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

export const getCar = async (carId) => {
  try {
    const response = await fetch(`http://localhost:5000/cars/${carId}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error al obtener coche #${carId}:`, error);
    return null;
  }
};

// Funciones para gestionar reseñas
export const getReviews = async (carId) => {
  try {
    const response = await fetch(`http://localhost:5000/reviews/${carId}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error al obtener reseñas:", error);
    return { reviews: [], avgRating: 0, total: 0 };
  }
};

export const addReview = async (review, token) => {
  try {
    const response = await fetch(`http://localhost:5000/reviews`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(review)
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error al añadir reseña:", error);
    return { success: false };
  }
};

export const updateReview = async (reviewId, review, token) => {
  try {
    const response = await fetch(`http://localhost:5000/reviews/${reviewId}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(review)
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error al actualizar reseña:", error);
    return { success: false };
  }
};

export const deleteReview = async (reviewId, token) => {
  try {
    const response = await fetch(`http://localhost:5000/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: authHeaders(token)
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error al eliminar reseña:", error);
    return { success: false };
  }
};

export const getCarAverageRating = async (carId) => {
  try {
    const response = await fetch(`http://localhost:5000/cars/${carId}/average-rating`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error al obtener puntuación media:", error);
    return { avgRating: 0, total: 0 };
  }
};

// Uso alias para mantener compatibilidad con CarItem.jsx
export const getCarReviews = async (carId) => {
  try {
    const data = await getReviews(carId);
    return data.reviews || [];
  } catch (error) {
    console.error("Error al obtener reseñas del coche:", error);
    return [];
  }
};