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

// Función para decodificar el token JWT y extraer el ID de usuario
export const getUserIdFromToken = (token) => {
  if (!token) return null;
  
  try {
    // El token JWT tiene 3 partes separadas por puntos: header.payload.signature
    // Necesitamos decodificar la parte del payload (segunda parte)
    const payload = token.split('.')[1];
    
    // Decodificar el payload de base64
    const decodedPayload = JSON.parse(atob(payload));
    
    // Comprobar si el payload tiene un campo 'id' o 'sub' (subject) que normalmente contiene el ID
    return decodedPayload.id || decodedPayload.sub || decodedPayload.username;
  } catch (error) {
    console.error("Error al decodificar token:", error);
    return null;
  }
};

// Funciones para gestionar favoritos - Ya no incluimos username en la URL
export const getUserFavorites = async (token) => {
  try {
    // Si no hay token, devolver un objeto con array vacío
    if (!token) {
      console.warn('No hay token para obtener favoritos');
      return { carIds: [] };
    }

    const response = await fetch(`http://localhost:5000/favorites`, {
      method: 'GET',
      headers: authHeaders(token)
    });
    
    if (response.status === 401) {
      console.warn('Sesión expirada o token inválido');
      return { carIds: [] };
    }
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    // Asegurarnos de que devolvemos un objeto con carIds como array
    return { carIds: data.carIds || [] };
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

// Funciones para gestionar reservas
export const getBookings = async (token) => {
  try {
    if (!token) {
      console.error("No hay token disponible");
      return [];
    }
    
    console.log("Usando token:", token.substring(0, 15) + "...");
    
    // Modificar para usar el endpoint correcto
    const response = await fetch('http://localhost:5000/user/bookings', {
      method: 'GET',
      headers: authHeaders(token)
    });
    
    console.log("Respuesta del servidor:", response.status);
    
    if (response.status === 401) {
      console.warn('Sesión expirada o token inválido');
      return [];
    }
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Datos recibidos:", data);
    return data;
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    return [];
  }
};

export const createBooking = async (bookingData, token) => {
  try {
    console.log("Datos de reserva a enviar:", bookingData);
    console.log("Token disponible:", !!token);
    
    const formattedData = {
      ...bookingData,
      user_id: getUserIdFromToken(token), // Asegúrate de tener esta función
      // Otras propiedades
      start_date: bookingData.date + 'T' + bookingData.time + ':00',
      end_date: bookingData.return_date + 'T' + bookingData.return_time + ':00',
    };
    
    const response = await fetch('http://localhost:5000/bookings', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(formattedData)
    });
    
    console.log("Estado de respuesta:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => 
        ({ error: "Error al procesar la respuesta" }));
      console.error("Error detallado:", errorData);
      throw new Error(errorData.error || `Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Reserva creada:", data);
    return data;
  } catch (error) {
    console.error("Error al crear reserva:", error);
    throw error;
  }
};

export const deleteBooking = async (bookingId, token) => {
  try {
    console.log(`Intentando eliminar reserva ${bookingId}...`);
    
    const response = await fetch(`http://localhost:5000/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: authHeaders(token)
    });
    
    console.log(`Respuesta del servidor: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
      console.error("Error detallado:", errorData);
      throw new Error(errorData.error || `Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error al eliminar reserva:", error);
    throw error;
  }
};

// Solo para admins
export const getAllBookings = async (token) => {
  try {
    const response = await fetch('http://localhost:5000/admin/bookings', {
      method: 'GET',
      headers: authHeaders(token)
    });
    
    if (response.status === 403) {
      console.warn('Acceso denegado: se requiere permiso de administrador');
      return { error: 'Acceso denegado', bookings: [] };
    }
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return { bookings: await response.json() };
  } catch (error) {
    console.error("Error al obtener todas las reservas:", error);
    return { error: error.message, bookings: [] };
  }
};