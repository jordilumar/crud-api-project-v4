import json
import os
import jwt
from flask import Blueprint, jsonify, request
from functools import wraps

favorites_bp = Blueprint('favorites', __name__)

FAVORITES_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'favorites.json')
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "default_dev_key_CHANGE_IN_PRODUCTION")

def load_favorites():
    if not os.path.exists(FAVORITES_FILE):
        with open(FAVORITES_FILE, 'w') as f:
            json.dump({"favorites": []}, f)
        return {"favorites": []}
    
    with open(FAVORITES_FILE, 'r') as f:
        return json.load(f)

def save_favorites(data):
    with open(FAVORITES_FILE, 'w') as f:
        json.dump(data, f, indent=2)

# Decorador para extraer username del token JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token requerido'}), 401
            
        try:
            # Decodificar el token para obtener el username
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            username = payload['username']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token inválido'}), 401
            
        return f(username, *args, **kwargs)
    
    return decorated

# Rutas actualizadas - ya no toman username de la URL
@favorites_bp.route('/favorites', methods=['GET'])
@token_required
def get_user_favorites(username):
    data = load_favorites()
    
    for user in data['favorites']:
        if user['username'] == username:
            return jsonify({"carIds": user['carIds']})
    
    # Si el usuario no existe, devuelve una lista vacía
    return jsonify({"carIds": []})

@favorites_bp.route('/favorites/add/<int:car_id>', methods=['POST'])
@token_required
def add_favorite(username, car_id):
    data = load_favorites()
    
    # Buscar al usuario en la lista
    user_exists = False
    for user in data['favorites']:
        if user['username'] == username:
            user_exists = True
            # Agregar coche a favoritos si no está ya
            if car_id not in user['carIds']:
                user['carIds'].append(car_id)
            break
    
    # Si el usuario no existe, lo creamos
    if not user_exists:
        data['favorites'].append({
            "username": username,
            "carIds": [car_id]
        })
    
    save_favorites(data)
    return jsonify({"message": "Coche añadido a favoritos", "success": True})

@favorites_bp.route('/favorites/remove/<int:car_id>', methods=['DELETE'])
@token_required
def remove_favorite(username, car_id):
    data = load_favorites()
    
    for user in data['favorites']:
        if user['username'] == username:
            if car_id in user['carIds']:
                user['carIds'].remove(car_id)
                save_favorites(data)
                return jsonify({"message": "Coche eliminado de favoritos", "success": True})
            else:
                return jsonify({"message": "El coche no está en favoritos", "success": False})
    
    return jsonify({"message": "Usuario no encontrado", "success": False})