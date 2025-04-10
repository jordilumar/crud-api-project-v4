from flask import Blueprint, jsonify, request
from models.sale import Sale
import json
import os

sales_bp = Blueprint('sales', __name__)

SALES_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '../database/sales.json'))
DB_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '../database/db.json'))

def read_file(file_path):
    if not os.path.exists(file_path):
        return []
    with open(file_path, 'r') as f:
        return json.load(f)

def read_sales_db():
    if not os.path.exists(SALES_FILE):
        return []
    with open(SALES_FILE, 'r') as f:
        return json.load(f)

@sales_bp.route('/sales', methods=['GET'])
def get_sales():
    model = request.args.get('model')  # Obtener el parámetro 'model' de la URL
    sales = read_sales_db()

    # Filtrar por modelo si se proporciona
    if model:
        sales = [sale for sale in sales if sale['model'].lower() == model.lower()]  # Filtrar por modelo

    return jsonify({
        "data": sales,
        "total": len(sales),
    }), 200

@sales_bp.route('/sales/annual', methods=['GET'])
def get_annual_sales():
    sales = read_file(SALES_FILE)

    # Agrupar ventas por país
    country_sales = {}
    for sale in sales:
        country = sale['country']
        units = sale['units_sold']
        if country not in country_sales:
            country_sales[country] = 0
        country_sales[country] += units

    # Formatear los datos para el frontend
    formatted_sales = [
        {"country": country, "total_units": units}
        for country, units in country_sales.items()
    ]

    # Ordenar por unidades vendidas de mayor a menor
    formatted_sales.sort(key=lambda x: x["total_units"], reverse=True)

    return jsonify(formatted_sales), 200

@sales_bp.route('/sales/top-models', methods=['GET'])
def get_top_models():
    sales = read_file(SALES_FILE)

    # Agrupar ventas por modelo
    model_sales = {}
    for sale in sales:
        model = sale['model']
        units = sale['units_sold']
        if model not in model_sales:
            model_sales[model] = 0
        model_sales[model] += units

    # Formatear los datos para el frontend
    formatted_sales = [
        {"model": model, "total_units": units}
        for model, units in model_sales.items()
    ]

    # Ordenar por unidades vendidas de mayor a menor
    formatted_sales.sort(key=lambda x: x["total_units"], reverse=True)

    return jsonify(formatted_sales), 200

@sales_bp.route('/sales/total-by-year', methods=['GET'])
def get_total_sales_by_year():
    sales = read_file(SALES_FILE)

    # Agrupar ventas por año
    year_sales = {}
    for sale in sales:
        year = sale['year']
        units = sale['units_sold']
        year_sales[year] = year_sales.get(year, 0) + units

    # Formatear los datos para el frontend
    formatted_sales = [{"year": year, "total_units": units} for year, units in year_sales.items()]
    formatted_sales.sort(key=lambda x: x["year"])  # Ordenar por año

    return jsonify(formatted_sales), 200
