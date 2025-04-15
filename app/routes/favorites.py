import json
import os
from flask import Blueprint, jsonify, request

favorites_bp = Blueprint('favorites', __name__)

FAVORITES_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'favorites.json')

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

@favorites_bp.route('/favorites/<username>', methods=['GET'])
def get_user_favorites(username):
    data = load_favorites()
    
    for user in data['favorites']:
        if user['username'] == username:
            return jsonify({"carIds": user['carIds']})
    
    # Si el usuario no existe, devuelve una lista vacía
    return jsonify({"carIds": []})

@favorites_bp.route('/favorites/<username>/add/<int:car_id>', methods=['POST'])
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

@favorites_bp.route('/favorites/<username>/remove/<int:car_id>', methods=['DELETE'])
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