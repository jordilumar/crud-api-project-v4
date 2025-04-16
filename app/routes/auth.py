from flask import Blueprint, request, jsonify, Response
from werkzeug.security import generate_password_hash, check_password_hash
import base64
import json
import os
import re

# Crear el blueprint sin prefijos
auth_bp = Blueprint('auth', __name__)

# Configuración del almacenamiento de usuarios
USERS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database/users.json')

# Función para asegurar que el directorio existe
def ensure_dir():
    directory = os.path.dirname(USERS_FILE)
    if not os.path.exists(directory):
        os.makedirs(directory)

# Cargar usuarios
def load_users():
    ensure_dir()
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w') as f:
            json.dump([], f)
        return []
    
    with open(USERS_FILE, 'r') as f:
        return json.load(f)

# Guardar usuarios
def save_users(users):
    ensure_dir()
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=4)

# Extraer credenciales de autenticación básica
def get_basic_auth_credentials():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Basic '):
        return None, None
    
    try:
        # Decodificar las credenciales base64
        encoded_credentials = auth_header.split(' ')[1]
        decoded_credentials = base64.b64decode(encoded_credentials).decode('utf-8')
        username, password = decoded_credentials.split(':', 1)
        return username, password
    except Exception:
        return None, None

# Clave secreta para JWT - MODIFICADO
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "default_dev_key_CHANGE_IN_PRODUCTION")

# Si no hay variable de entorno y estamos en producción, lanzar un error
if os.environ.get("FLASK_ENV") == "production" and SECRET_KEY == "default_dev_key_CHANGE_IN_PRODUCTION":
    import sys
    print("ERROR: JWT_SECRET_KEY no configurada en entorno de producción", file=sys.stderr)

@auth_bp.route('/register', methods=['POST'])
def register():
    # Obtener credenciales de la autenticación básica
    username, password = get_basic_auth_credentials()
    
    # Validar datos
    if not username or not password:
        return jsonify({'error': 'Se requieren nombre de usuario y contraseña'}), 400
    
    # Validar formato de email
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, username):
        return jsonify({'error': 'El nombre de usuario debe ser un email válido'}), 400
    
    # Cargar usuarios existentes
    users = load_users()
    
    # Verificar si el usuario ya existe
    if any(user['username'] == username for user in users):
        return jsonify({'error': 'El nombre de usuario ya existe'}), 400
    
    # Crear nuevo usuario con contraseña encriptada
    hashed_password = generate_password_hash(password)
    new_user = {'username': username, 'password': hashed_password}
    users.append(new_user)
    
    # Guardar en el archivo JSON
    save_users(users)
    
    return jsonify({'message': 'Usuario registrado exitosamente'}), 201

@auth_bp.route('/login', methods=['GET'])
def login():
    # Obtener credenciales de la autenticación básica
    username, password = get_basic_auth_credentials()
    
    if not username or not password:
        # Si no hay credenciales, solicitar autenticación
        return Response('Se requiere autenticación', 401, 
                        {'WWW-Authenticate': 'Basic realm="Login Required"'})
    
    # Cargar usuarios existentes
    users = load_users()
    
    # Buscar usuario
    user = next((user for user in users if user['username'] == username), None)
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'error': 'Usuario o contraseña inválidos'}), 401
    
    # Simple token para mantener compatibilidad con el frontend
    return jsonify({'token': 'basic_auth_token', 'username': username}), 200