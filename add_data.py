import json
import random
import os

# File paths
db_file = r"c:\Users\JordiLumbreras\Desktop\crud-api-project-v4\app\database\db.json"
sales_file = r"c:\Users\JordiLumbreras\Desktop\crud-api-project-v4\app\database\sales.json"

# Verifica si el archivo existe, si no, lo inicializa con un array vacío
def ensure_file_exists(file_path):
    if not os.path.exists(file_path):
        with open(file_path, 'w') as f:
            json.dump([], f, indent=4)

# Asegúrate de que los archivos existan
ensure_file_exists(db_file)
ensure_file_exists(sales_file)

# Helper functions to generate realistic data
def generate_realistic_car(id):
    makes_and_models = {
        "Toyota": ["Corolla", "Camry", "RAV4", "Highlander", "Tacoma"],
        "Honda": ["Civic", "Accord", "CR-V", "Pilot", "Fit"],
        "Ford": ["Focus", "Fusion", "Escape", "Explorer", "F-150"],
        "Chevrolet": ["Malibu", "Impala", "Equinox", "Tahoe", "Silverado"],
        "Nissan": ["Altima", "Sentra", "Rogue", "Pathfinder", "Frontier"],
        "BMW": ["3 Series", "5 Series", "X3", "X5", "Z4"],
        "Audi": ["A4", "A6", "Q5", "Q7", "TT"],
        "Mercedes-Benz": ["C-Class", "E-Class", "GLC", "GLE", "S-Class"],
        "Volkswagen": ["Passat", "Jetta", "Tiguan", "Golf", "Atlas"],
        "Hyundai": ["Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade"],
        "Tesla": ["Model S", "Model 3", "Model X", "Model Y"],
        "Kia": ["Sportage", "Sorento", "Optima", "Telluride", "Soul"],
        "Mazda": ["Mazda3", "Mazda6", "CX-5", "CX-9", "MX-5"],
        "Subaru": ["Impreza", "Outback", "Forester", "Ascent", "WRX"],
        "Jeep": ["Wrangler", "Cherokee", "Grand Cherokee", "Compass", "Renegade"]
    }
    features = [
        "Bluetooth", "Air Conditioning", "Backup Camera", "Cruise Control",
        "Heated Seats", "Sunroof", "Navigation System", "Blind Spot Monitor",
        "Apple CarPlay", "Wi-Fi Hotspot", "Lane Departure Warning", "Remote Start",
        "ProPILOT Assist", "All-Wheel Drive", "Android Auto", "Gesture Control",
        "Harman Kardon Sound System", "Heads-Up Display", "Panoramic Roof",
        "Ambient Lighting", "Digital Cockpit", "Adaptive Cruise Control",
        "Park Assist", "Wireless Charging", "SmartSense", "Bose Premium Audio"
    ]
    make = random.choice(list(makes_and_models.keys()))
    model = random.choice(makes_and_models[make])
    return {
        "id": id,
        "make": make,
        "model": model,
        "year": random.randint(1990, 2025),
        "features": random.sample(features, 3)
    }

def generate_sales_for_car(car):
    sales = []
    for year in range(2015, 2025):  # Generar datos de ventas para los últimos 10 años
        sales.append({
            "year": year,
            "model": car["model"],
            "country": random.choice([
                "USA", "Canada", "UK", "Germany", "Japan", "France", "Italy",
                "Netherlands", "South Korea", "Mexico", "Australia", "New Zealand",
                "China", "Sweden", "India", "Thailand", "Switzerland", "Brazil", "Argentina"
            ]),
            "units_sold": random.randint(50, 500)  # Ventas aleatorias entre 50 y 500 unidades
        })
    return sales

# Load existing data
with open(db_file, "r") as f:
    db_data = json.load(f)

with open(sales_file, "r") as f:
    sales_data = json.load(f)

# Add 150 new entries to db.json
next_id = max((car["id"] for car in db_data), default=0) + 1
for _ in range(150):
    new_car = generate_realistic_car(next_id)
    db_data.append(new_car)
    # Generar ventas para el coche recién creado
    sales_data.extend(generate_sales_for_car(new_car))
    next_id += 1

# Save updated data back to files
with open(db_file, "w") as f:
    json.dump(db_data, f, indent=4)

with open(sales_file, "w") as f:
    json.dump(sales_data, f, indent=4)

print("150 new entries added to db.json and sales.json!")