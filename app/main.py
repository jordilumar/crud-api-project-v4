from flask import Flask
from flask_cors import CORS
from routes.cars import cars_bp
from routes.sales import sales_bp

app = Flask(__name__)
CORS(app) 

app.register_blueprint(cars_bp, url_prefix='/')
app.register_blueprint(sales_bp, url_prefix='/')

if __name__ == '__main__':
    app.run(debug=True)