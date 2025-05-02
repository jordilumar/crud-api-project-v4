from flask import Blueprint, request, jsonify, Response
from werkzeug.security import generate_password_hash, check_password_hash
import base64
import json
import os
import re
import jwt
from datetime import datetime, timedelta

# Crear el blueprint sin prefijos
auth_bp = Blueprint('auth', __name__)

# Configuración del almacenamiento de usuarios
USERS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database/users.json')

# Clave secreta para JWT
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "default_dev_key_CHANGE_IN_PRODUCTION")

# Si no hay variable de entorno y estamos en producción, lanzar un error
if os.environ.get("FLASK_ENV") == "production" and SECRET_KEY == "default_dev_key_CHANGE_IN_PRODUCTION":
    import sys
    print("ERROR: JWT_SECRET_KEY no configurada en entorno de producción", file=sys.stderr)

# Funciones de gestión de usuarios
def ensure_dir():
    directory = os.path.dirname(USERS_FILE)
    if not os.path.exists(directory):
        os.makedirs(directory)

def load_users():
    ensure_dir()
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w') as f:
            json.dump([], f)
        return []
    
    with open(USERS_FILE, 'r') as f:
        return json.load(f)

def save_users(users):
    ensure_dir()
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=4)

# Esta función solo se usará para el proceso inicial de login
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

# Añadir campo "is_admin" al registrar usuarios
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
    # Por defecto, los nuevos usuarios no son administradores
    new_user = {
        'username': username, 
        'password': hashed_password,
        'is_admin': False  # Añadimos este campo
    }
    users.append(new_user)
    
    # Guardar en el archivo JSON
    save_users(users)
    
    # Generar token JWT incluyendo el rol de usuario
    token_payload = {
        'username': username,
        'is_admin': False,  # Incluir el rol en el token
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    token = jwt.encode(token_payload, SECRET_KEY, algorithm='HS256')
    
    return jsonify({
        'message': 'Usuario registrado exitosamente',
        'token': token,
        'username': username,
        'is_admin': False
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    # Obtener credenciales solo para el proceso de login
    username, password = get_basic_auth_credentials()
    
    if not username or not password:
        return jsonify({'error': 'Credenciales incompletas'}), 401
    
    # Cargar usuarios existentes
    users = load_users()
    
    # Buscar usuario y verificar contraseña hasheada (esto es seguro)
    user = next((user for user in users if user['username'] == username), None)
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'error': 'Usuario o contraseña inválidos'}), 401
    
    # Verificar si el usuario es admin (si no tiene el campo, asumimos False)
    is_admin = user.get('is_admin', False)
    
    # Generar token JWT con información de rol
    token_payload = {
        'username': username,
        'is_admin': is_admin,  # Incluir el rol en el token
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    token = jwt.encode(token_payload, SECRET_KEY, algorithm='HS256')
    
    return jsonify({
        'token': token,
        'username': username,
        'is_admin': is_admin
    }), 200

# Nueva función para verificar tokens JWT
def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload['username']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# Middleware para verificar token
def token_required(f):
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token requerido'}), 401
            
        username = verify_token(token)
        if not username:
            return jsonify({'error': 'Token inválido o expirado'}), 401
            
        return f(username, *args, **kwargs)
    
    # Mantener el nombre de la función para Flask
    decorated.__name__ = f.__name__
    return decorated

# Ejemplo de ruta protegida
@auth_bp.route('/user-info', methods=['GET'])
@token_required
def user_info(username):
    return jsonify({'username': username})