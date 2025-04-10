import os
import json
import pytest
from app.routes.cars import cars_bp, DB_FILE
from flask import Flask

@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(cars_bp)
    with app.test_client() as client:
        yield client

@pytest.fixture(autouse=True)
def setup_db():
    # Asegurarse de que el archivo db.json esté vacío antes de cada prueba
    with open(DB_FILE, 'w') as f:
        json.dump([], f, indent=4)
    yield
    os.remove(DB_FILE)

def test_get_cars(client):
    # Agregar datos al archivo db.json antes de la prueba
    initial_data = [
        {"id": 0, "make": "Toyota", "model": "Corolla", "year": 2020},
        {"id": 1, "make": "Honda", "model": "Civic", "year": 2021}
    ]
    with open(DB_FILE, 'w') as f:
        json.dump(initial_data, f, indent=4)

    response = client.get('/cars')
    assert response.status_code == 200
    assert len(response.get_json()) == 2

def test_create_car(client):
    new_car = {"id": 2, "make": "Ford", "model": "Focus", "year": 2022}
    response = client.post('/cars', json=new_car)
    assert response.status_code == 201
    assert response.get_json() == new_car

    # Verificar que el nuevo coche se haya guardado en db.json
    with open(DB_FILE, 'r') as f:
        cars = json.load(f)
    assert len(cars) == 1
    assert cars[0] == new_car

def test_update_car(client):
    # Agregar datos al archivo db.json antes de la prueba
    initial_data = [
        {"id": 0, "make": "Toyota", "model": "Corolla", "year": 2020}
    ]
    with open(DB_FILE, 'w') as f:
        json.dump(initial_data, f, indent=4)

    updated_car = {"id": 0, "make": "Toyota", "model": "Camry", "year": 2020}
    response = client.put('/cars/0', json=updated_car)
    assert response.status_code == 200
    assert response.get_json() == updated_car

    # Verificar que el coche actualizado se haya guardado en db.json
    with open(DB_FILE, 'r') as f:
        cars = json.load(f)
    assert cars[0] == updated_car

def test_delete_car(client):
    # Agregar datos al archivo db.json antes de la prueba
    initial_data = [
        {"id": 0, "make": "Toyota", "model": "Corolla", "year": 2020}
    ]
    with open(DB_FILE, 'w') as f:
        json.dump(initial_data, f, indent=4)

    response = client.delete('/cars/0')
    assert response.status_code == 200
    assert response.get_json()["make"] == "Toyota"

    # Verificar que el coche se haya eliminado de db.json
    with open(DB_FILE, 'r') as f:
        cars = json.load(f)
    assert len(cars) == 0

def test_update_car_not_found(client):
    updated_car = {"id": 3, "make": "Nissan", "model": "Altima", "year": 2023}
    response = client.put('/cars/3', json=updated_car)
    assert response.status_code == 404
    assert response.get_json() == {'error': 'Car not found'}

def test_delete_car_not_found(client):
    response = client.delete('/cars/3')
    assert response.status_code == 404
    assert response.get_json() == {'error': 'Car not found'}
