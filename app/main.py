from flask import Flask, jsonify, request
from flask_cors import CORS
from routes.cars import cars_bp
from routes.sales import sales_bp
from routes.favorites import favorites_bp
from routes.auth import auth_bp
from routes.reviews import reviews_bp
from routes.bookings import bookings_bp

app = Flask(__name__)

# Use ONLY the Flask-CORS extension for handling CORS
CORS(app, 
     resources={r"/*": {"origins": "*"}}, 
     supports_credentials=True,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

# Add explicit OPTIONS handler without adding CORS headers (Flask-CORS will handle them)
@app.route('/<path:path>', methods=['OPTIONS'])
@app.route('/', methods=['OPTIONS'])
def options_handler(*args, **kwargs):
    response = app.make_default_options_response()
    return response

# Error handlers without duplicate CORS headers
@app.errorhandler(500)
def internal_error(error):
    response = jsonify({"error": "Error interno del servidor", "details": str(error)})
    response.status_code = 500
    return response

@app.errorhandler(404)
def not_found(error):
    response = jsonify({"error": "Recurso no encontrado"})
    response.status_code = 404
    return response

@app.errorhandler(403)
def forbidden(error):
    response = jsonify({"error": "Acceso prohibido"})
    response.status_code = 403
    return response

# Register blueprints
app.register_blueprint(cars_bp)
app.register_blueprint(sales_bp)
app.register_blueprint(favorites_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(reviews_bp)
app.register_blueprint(bookings_bp)

@app.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Server is running!"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)