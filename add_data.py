import json
import random

# File paths
db_file = r"c:\Users\JordiLumbreras\Desktop\crud-api-project-v2\crud-api-project-v2\app\database\db.json"
sales_file = r"c:\Users\JordiLumbreras\Desktop\crud-api-project-v2\crud-api-project-v2\app\database\sales.json"

# Helper functions to generate random data
def generate_random_car(id):
    makes = ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Audi", "Mercedes-Benz", "Volkswagen", "Hyundai", "Tesla", "Kia", "Mazda", "Subaru", "Jeep"]
    models = ["Corolla", "Civic", "Focus", "Malibu", "Altima", "3 Series", "A4", "C-Class", "Passat", "Elantra", "Model S", "Model 3", "Model X", "Model Y", "Sportage"]
    features = ["Bluetooth", "Air Conditioning", "Backup Camera", "Cruise Control", "Heated Seats", "Sunroof", "Navigation System", "Blind Spot Monitor", "Apple CarPlay", "Wi-Fi Hotspot", "Lane Departure Warning", "Remote Start", "ProPILOT Assist", "All-Wheel Drive", "Android Auto", "Gesture Control", "Harman Kardon Sound System", "Heads-Up Display", "Virtual Cockpit", "Quattro AWD", "LED Headlights", "MBUX System", "Panoramic Roof", "Ambient Lighting", "Digital Cockpit", "Adaptive Cruise Control", "Park Assist", "Wireless Charging", "SmartSense", "Bose Premium Audio"]
    return {
        "id": id,
        "make": random.choice(makes),
        "model": random.choice(models),
        "year": random.randint(2000, 2025),
        "features": random.sample(features, 3)
    }

def generate_random_sale():
    models = ["Corolla", "Civic", "Focus", "Malibu", "Altima", "3 Series", "A4", "C-Class", "Passat", "Elantra", "Model S", "Model 3", "Model X", "Model Y", "Sportage"]
    countries = ["USA", "Canada", "UK", "Germany", "Japan", "France", "Italy", "Netherlands", "South Korea", "Mexico", "Australia", "New Zealand", "China", "Sweden", "India", "Thailand", "Switzerland", "Brazil", "Argentina"]
    return {
        "year": random.randint(2000, 2025),
        "model": random.choice(models),
        "country": random.choice(countries),
        "units_sold": random.randint(1000, 500000)
    }

# Load existing data
with open(db_file, "r") as f:
    db_data = json.load(f)

with open(sales_file, "r") as f:
    sales_data = json.load(f)

# Add 150 new entries to db.json
next_id = max(car["id"] for car in db_data) + 1
for _ in range(150):
    db_data.append(generate_random_car(next_id))
    next_id += 1

# Add 150 new entries to sales.json
for _ in range(150):
    sales_data.append(generate_random_sale())

# Save updated data back to files
with open(db_file, "w") as f:
    json.dump(db_data, f, indent=4)

with open(sales_file, "w") as f:
    json.dump(sales_data, f, indent=4)

print("150 new entries added to db.json and sales.json!")