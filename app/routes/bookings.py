from flask import Blueprint, request, jsonify
from routes.auth import token_required
import json
import os
from datetime import datetime
import jwt
from config import SECRET_KEY
from routes.auth import load_users
from pathlib import Path

bookings_bp = Blueprint('bookings', __name__)

# Cambiar la ruta al archivo para que apunte a la carpeta correcta
DATABASE_DIR = os.path.join(os.path.dirname(__file__), '..', 'database')
BOOKINGS_FILE = os.path.join(DATABASE_DIR, 'bookings.json')
USERS_FILE = os.path.join(DATABASE_DIR, 'users.json')  # Add this line

# Funciones auxiliares para gestionar el almacenamiento
def read_bookings():
    if not os.path.exists(BOOKINGS_FILE):
        # Crear directorio si no existe
        os.makedirs(os.path.dirname(BOOKINGS_FILE), exist_ok=True)
        # Crear archivo vacío con una lista
        with open(BOOKINGS_FILE, 'w') as f:
            json.dump([], f)
        return []
    
    with open(BOOKINGS_FILE, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def write_bookings(bookings):
    if not os.path.exists(DATABASE_DIR):
        os.makedirs(DATABASE_DIR)
    with open(BOOKINGS_FILE, 'w') as f:
        json.dump(bookings, f, indent=4)

def load_bookings():
    """Cargar todas las reservas del archivo JSON"""
    try:
        if not os.path.exists(BOOKINGS_FILE):
            return []
        with open(BOOKINGS_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error al cargar reservas: {str(e)}")
        return []

def save_bookings(bookings):
    """Guardar todas las reservas en el archivo JSON"""
    with open(BOOKINGS_FILE, 'w') as f:
        json.dump(bookings, f, indent=4)

# Helper function to get full user details
def get_user_details(username):
    with open(USERS_FILE, 'r') as f:
        users = json.load(f)
    
    return next((user for user in users if user['username'] == username), None)

# Endpoints para reservas
@bookings_bp.route('/bookings', methods=['GET'])
@token_required
def get_bookings(current_user):
    try:
        with open(BOOKINGS_FILE, 'r') as f:
            bookings = json.load(f)
        
        # Get user details
        user_id = None
        is_admin = False
        
        if isinstance(current_user, str):
            # current_user is a username
            with open(USERS_FILE, 'r') as f:
                users = json.load(f)
            
            user = next((u for u in users if u['username'] == current_user), None)
            if user:
                user_id = user.get('id')
                is_admin = user.get('is_admin', False)
        else:
            # current_user is already a dict
            user_id = current_user.get('id')
            is_admin = current_user.get('is_admin', False)
        
        # If admin, return all bookings
        if is_admin:
            return jsonify(bookings), 200
        
        # For regular users, filter bookings to show only their own
        user_bookings = [booking for booking in bookings if str(booking.get('user_id')) == str(user_id)]
        return jsonify(user_bookings), 200
        
    except Exception as e:
        print(f"Error al obtener reservas: {str(e)}")
        return jsonify({'error': f'Error al obtener reservas: {str(e)}'}), 500

@bookings_bp.route('/bookings', methods=['POST'])
@token_required
def create_booking(current_user):
    try:
        # Imprimir información de depuración
        print("Current user type:", type(current_user))
        print("Current user value:", current_user)
        
        booking_data = request.json
        bookings = read_bookings()
        
        # Validar datos de entrada
        required_fields = ['car_id', 'date', 'time', 'return_date', 'return_time']
        for field in required_fields:
            if field not in booking_data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Manejar el current_user de manera segura según su tipo
        if isinstance(current_user, dict):
            user_id = current_user.get('id')
        else:
            # Si no es un diccionario, asumimos que el current_user es el ID directamente
            # o algún otro identificador que podamos utilizar
            user_id = current_user
            
        # Crear objeto de reserva - asegurarse que car_id sea entero
        try:
            car_id = int(booking_data['car_id'])
        except (ValueError, TypeError):
            return jsonify({'error': 'car_id debe ser un número entero'}), 400
            
        new_booking = {
            'id': len(bookings) + 1,
            'user_id': user_id,
            'car_id': car_id,
            'date': booking_data['date'],
            'time': booking_data['time'],
            'return_date': booking_data['return_date'],
            'return_time': booking_data['return_time'],
            'created_at': datetime.now().isoformat()
        }
        
        # Verificar si ya existe una reserva para ese coche en ese horario
        for booking in bookings:
            if (booking['car_id'] == new_booking['car_id'] and 
                booking['date'] == new_booking['date'] and 
                booking['time'] == new_booking['time']):
                return jsonify({
                    'error': 'Este coche ya está reservado para esa fecha y hora'
                }), 400
        
        bookings.append(new_booking)
        write_bookings(bookings)
        
        return jsonify(new_booking), 201
    except Exception as e:
        import traceback
        print("Error al procesar la reserva:")
        traceback.print_exc()  # Imprimir el stacktrace completo
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@bookings_bp.route('/bookings/<int:booking_id>', methods=['DELETE'])
@token_required
def delete_booking(username, booking_id):
    try:
        # Ruta al archivo de reservas
        bookings_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database/bookings.json')
        
        # Cargar las reservas
        with open(bookings_file, 'r') as f:
            bookings = json.load(f)
        
        # Buscar la reserva por ID
        booking_index = None
        for i, booking in enumerate(bookings):
            if booking.get('id') == booking_id:
                booking_index = i
                break
                
        if booking_index is None:
            return jsonify({"error": "Reserva no encontrada"}), 404
        
        # Comprobar que el usuario es el propietario de la reserva
        booking_user_id = bookings[booking_index].get('user_id')
        
        # Comparar el username del token con el user_id de la reserva
        if username != booking_user_id:
            return jsonify({"error": "No tienes permiso para cancelar esta reserva"}), 403
        
        # Eliminar la reserva
        deleted_booking = bookings.pop(booking_index)
        
        # Guardar los cambios
        with open(bookings_file, 'w') as f:
            json.dump(bookings, f, indent=4)
        
        return jsonify({
            "message": "Reserva cancelada correctamente",
            "booking": deleted_booking
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error al eliminar reserva: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Error del servidor: {str(e)}"}), 500

# Endpoint para obtener todas las reservas (solo admin)
@bookings_bp.route('/admin/bookings', methods=['GET'])
@token_required
def get_all_bookings(username):
    # Load the full user object to check admin status
    users = load_users()
    current_user = next((user for user in users if user['username'] == username), {})
    
    # Now check admin status from the user object
    if not current_user.get('is_admin', False):
        return jsonify({"error": "Acceso denegado. Se requieren privilegios de administrador."}), 403
    
    # Continue with existing function logic...
    bookings = read_bookings()
    return jsonify(bookings)

# Modificar la función que agregamos para evitar el conflicto de nombres
@bookings_bp.route('/admin/bookings', methods=['GET'], endpoint='admin_get_all_bookings')  # Cambiado el endpoint
def admin_get_all_bookings():  # Renombrada la función
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Token no proporcionado o formato incorrecto"}), 401
        
        # Extraer el token
        token = auth_header.split(' ')[1]
        
        try:
            # Verificar el token y los permisos de administrador
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            is_admin = payload.get('is_admin', False)
            
            if not is_admin:
                return jsonify({"error": "Acceso denegado. Se requiere rol de administrador"}), 403
                
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token inválido"}), 401
        
        # Obtener todas las reservas
        bookings = load_bookings()
        
        return jsonify(bookings), 200
        
    except Exception as e:
        print(f"Error al obtener todas las reservas: {str(e)}")
        return jsonify({"error": f"Error del servidor: {str(e)}"}), 500

# Ruta para obtener las reservas del usuario autenticado
@bookings_bp.route('/user/bookings', methods=['GET'])
@token_required
def get_user_bookings(username):  # La función token_required pasa el username, no un diccionario
    try:
        # El username será el correo electrónico del usuario (yu@yu.com)
        user_id = username  # Usa directamente el username como user_id
        
        # Log para depuración
        print(f"Buscando reservas para: {user_id}")
        
        # Abrir el archivo de reservas
        bookings_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database/bookings.json')
        if not os.path.exists(bookings_file):
            return jsonify([]), 200
            
        with open(bookings_file, 'r') as f:
            bookings = json.load(f)
        
        # Filtrar las reservas que pertenecen al usuario
        user_bookings = [booking for booking in bookings if booking.get('user_id') == user_id]
        
        # Log para depuración
        print(f"User ID: {user_id}, Found bookings: {len(user_bookings)}")
        print(f"Todas las reservas: {bookings}")
        print(f"Reservas filtradas: {user_bookings}")
        
        return jsonify(user_bookings), 200
    except Exception as e:
        import traceback
        print(f"Error al obtener reservas de usuario: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500