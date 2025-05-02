from flask import Blueprint, jsonify, request
import json
import os
import datetime
from functools import wraps
import jwt

reviews_bp = Blueprint('reviews', __name__)

# Configuración
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "default_dev_key_CHANGE_IN_PRODUCTION")
REVIEWS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'reviews.json')

# Función para verificar token
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
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            username = payload['username']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token inválido'}), 401
            
        return f(username, *args, **kwargs)
    
    return decorated

# Funciones para manejar el archivo de reseñas
def ensure_reviews_file_exists():
    directory = os.path.dirname(REVIEWS_FILE)
    if not os.path.exists(directory):
        os.makedirs(directory)
    
    if not os.path.exists(REVIEWS_FILE):
        with open(REVIEWS_FILE, 'w') as f:
            json.dump({"reviews": []}, f)

def load_reviews():
    ensure_reviews_file_exists()
    try:
        with open(REVIEWS_FILE, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {"reviews": []}

def save_reviews(data):
    ensure_reviews_file_exists()
    with open(REVIEWS_FILE, 'w') as f:
        json.dump(data, f, indent=4)

# Endpoint para obtener reseñas de un coche
@reviews_bp.route('/reviews/<int:car_id>', methods=['GET'])
def get_reviews(car_id):
    data = load_reviews()
    car_reviews = [review for review in data["reviews"] if review["car_id"] == car_id]
    
    # Calcular la media de puntuación
    avg_rating = 0
    if car_reviews:
        avg_rating = sum(review["rating"] for review in car_reviews) / len(car_reviews)
    
    return jsonify({
        "reviews": car_reviews,
        "avgRating": round(avg_rating, 1),
        "total": len(car_reviews)
    })

# Endpoint para crear una reseña
@reviews_bp.route('/reviews', methods=['POST'])
@token_required
def create_review(username):
    data = load_reviews()
    review_data = request.json
    
    if not all(key in review_data for key in ["car_id", "text", "rating"]):
        return jsonify({"error": "Faltan datos requeridos"}), 400
    
    rating = int(review_data.get("rating", 0))
    if not (1 <= rating <= 5):
        return jsonify({"error": "La puntuación debe estar entre 1 y 5"}), 400
    
    # Crear ID único para la reseña
    review_id = 1
    if data["reviews"]:
        review_id = max(review["id"] for review in data["reviews"]) + 1
    
    new_review = {
        "id": review_id,
        "car_id": review_data["car_id"],
        "username": username,
        "text": review_data["text"],
        "rating": rating,
        "date": datetime.datetime.now().isoformat()
    }
    
    data["reviews"].append(new_review)
    save_reviews(data)
    
    return jsonify({"review": new_review, "success": True}), 201

# Endpoint para actualizar una reseña
@reviews_bp.route('/reviews/<int:review_id>', methods=['PUT'])
@token_required
def update_review(username, review_id):
    data = load_reviews()
    review_data = request.json
    
    # Buscar la reseña
    for review in data["reviews"]:
        if review["id"] == review_id:
            # Verificar que es el propietario
            if review["username"] != username:
                return jsonify({"error": "No tienes permiso para editar esta reseña"}), 403
            
            if "text" in review_data:
                review["text"] = review_data["text"]
            
            if "rating" in review_data:
                rating = int(review_data["rating"])
                if not (1 <= rating <= 5):
                    return jsonify({"error": "La puntuación debe estar entre 1 y 5"}), 400
                review["rating"] = rating
            
            review["updated"] = datetime.datetime.now().isoformat()
            
            save_reviews(data)
            return jsonify({"review": review, "success": True})
    
    return jsonify({"error": "Reseña no encontrada"}), 404

# Endpoint para eliminar una reseña
@reviews_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
@token_required
def delete_review(username, review_id):
    data = load_reviews()
    
    for i, review in enumerate(data["reviews"]):
        if review["id"] == review_id:
            # Verificar que es el propietario
            if review["username"] != username:
                return jsonify({"error": "No tienes permiso para eliminar esta reseña"}), 403
            
            del data["reviews"][i]
            save_reviews(data)
            return jsonify({"message": "Reseña eliminada correctamente", "success": True})
    
    return jsonify({"error": "Reseña no encontrada"}), 404

# Endpoint para obtener la puntuación media de un coche
@reviews_bp.route('/cars/<int:car_id>/average-rating', methods=['GET'])
def get_average_rating(car_id):
    data = load_reviews()
    car_reviews = [review for review in data["reviews"] if review["car_id"] == car_id]
    
    if not car_reviews:
        return jsonify({"avgRating": 0, "total": 0})
    
    avg_rating = sum(review["rating"] for review in car_reviews) / len(car_reviews)
    return jsonify({
        "avgRating": round(avg_rating, 1),
        "total": len(car_reviews)
    })