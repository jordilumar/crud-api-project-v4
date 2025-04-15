from flask import Flask, jsonify
from flask_cors import CORS
from routes.cars import cars_bp
from routes.sales import sales_bp
from routes.auth import auth_bp
from routes.favorites import favorites_bp

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Registrar blueprints
app.register_blueprint(cars_bp)
app.register_blueprint(sales_bp)
app.register_blueprint(auth_bp)  # Sin prefijos adicionales
app.register_blueprint(favorites_bp)

# Ruta de prueba para verificar que el servidor está funcionando
@app.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Server is running!"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)